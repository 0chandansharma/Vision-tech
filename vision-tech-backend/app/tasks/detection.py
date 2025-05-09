# app/tasks/detection.py
import os
import time
import datetime
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from pymongo import MongoClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.detection import DetectionJob
from app.models.video import Video
from app.services.detection.yolo import YOLODetector
from app.services.detection.motion_detect import detect_motion

def start_detection_job(db: Session, job_id: int) -> None:
    """
    Start a detection job in the background.
    
    Args:
        db: Database session
        job_id: ID of the detection job
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        return
    
    # Get the video
    video = db.query(Video).filter(Video.id == job.video_id).first()
    if not video:
        # Update job status to failed
        job.status = "failed"
        job.error_message = "Video not found"
        db.commit()
        return
    
    # Update job status to in_progress
    job.status = "in_progress"
    job.started_at = datetime.datetime.now()
    db.commit()
    
    try:
        # Process the video based on the model
        if job.model_name.startswith("yolo"):
            process_yolo_detection(db, job, video)
        elif job.model_name == "motion_detection":
            process_motion_detection(db, job, video)
        else:
            raise ValueError(f"Unsupported model: {job.model_name}")
        
        # Update job status to completed
        job.status = "completed"
        job.completed_at = datetime.datetime.now()
        db.commit()
        
    except Exception as e:
        # Update job status to failed
        job.status = "failed"
        job.error_message = str(e)
        db.commit()

def process_yolo_detection(db: Session, job: DetectionJob, video: Video) -> None:
    """
    Process a video using YOLO object detection.
    
    Args:
        db: Database session
        job: Detection job
        video: Video to process
    """
    # Initialize YOLO detector
    model_path = os.path.join(settings.LOCAL_STORAGE_PATH, "models", f"{job.model_name}.pt")
    if not os.path.exists(model_path):
        model_path = f"{job.model_name}.pt"  # Use default model from ultralytics
        
    detector = YOLODetector(model_path)
    
    # Extract parameters
    params = job.parameters or {}
    conf_threshold = params.get("conf_threshold", 0.25)
    classes = params.get("classes")
    
    # Open video file
    video_path = os.path.join(settings.LOCAL_STORAGE_PATH, video.file_path)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")
    
    # Get video info
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    detection_collection = db_mongo["detection_results"]
    thumbnail_collection = db_mongo["object_thumbnails"]
    
    # Process video frames
    all_detections = []
    frame_number = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        timestamp = frame_number / fps
        
        # Perform detection
        detections, annotated_frame = detector.detect(
            frame, 
            conf_threshold=conf_threshold,
            classes=classes
        )
        
        # Store frame detections in MongoDB
        frame_data = {
            "job_id": job.id,
            "video_id": video.id,
            "frame_number": frame_number,
            "timestamp": timestamp,
            "detections": detections
        }
        detection_collection.insert_one(frame_data)
        
        # Process thumbnail for each detected object
        for detection in detections:
            # Get bounding box
            x, y, w, h = detection["bbox"]
            
            # Ensure valid bounding box
            x = max(0, int(x))
            y = max(0, int(y))
            w = min(int(w), width - x)
            h = min(int(h), height - y)
            
            if w <= 0 or h <= 0:
                continue
            
            # Extract thumbnail
            thumbnail = frame[y:y+h, x:x+w]
            
            # Save thumbnail image
            thumbnail_filename = f"{job.id}_{frame_number}_{detection['class_name']}_{int(time.time()*1000)}.jpg"
            thumbnail_path = os.path.join(
                settings.LOCAL_STORAGE_PATH,
                "thumbnails",
                thumbnail_filename
            )
            
            # Make sure thumbnails directory exists
            os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
            
            # Write thumbnail to file
            cv2.imwrite(thumbnail_path, thumbnail)
            
            # Store thumbnail reference in MongoDB
            thumbnail_data = {
                "job_id": job.id,
                "video_id": video.id,
                "frame_number": frame_number,
                "timestamp": timestamp,
                "class_id": detection["class_id"],
                "class_name": detection["class_name"],
                "confidence": detection["confidence"],
                "bbox": detection["bbox"],
                "thumbnail_url": f"/api/v1/detection/thumbnails/{job.id}/{thumbnail_filename}"
            }
            thumbnail_collection.insert_one(thumbnail_data)
        
        all_detections.append(detections)
        frame_number += 1
    
    cap.release()
    
    # Create timeline
    timeline = create_detection_timeline(job.id, video.id, all_detections, fps, frame_count)
    
    # Store timeline in MongoDB
    timeline_collection = db_mongo["timelines"]
    timeline_collection.insert_one(timeline)

def process_motion_detection(db: Session, job: DetectionJob, video: Video) -> None:
    """
    Process a video using motion detection.
    
    Args:
        db: Database session
        job: Detection job
        video: Video to process
    """
    # Extract parameters
    params = job.parameters or {}
    
    # Open video file
    video_path = os.path.join(settings.LOCAL_STORAGE_PATH, video.file_path)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")
    
    # Get video info
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    detection_collection = db_mongo["detection_results"]
    
    # Process video frames
    all_motion_events = []
    frame_number = 0
    
    # Reset state between videos
    if hasattr(detect_motion, "bg_model"):
        delattr(detect_motion, "bg_model")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        timestamp = frame_number / fps
        
        # Perform motion detection
        motion_detected, motion_areas = detect_motion(frame)
        
        # Store frame motion detections in MongoDB
        frame_data = {
            "job_id": job.id,
            "video_id": video.id,
            "frame_number": frame_number,
            "timestamp": timestamp,
            "detections": [] if not motion_detected else [
                {
                    "class_id": 0,
                    "class_name": "motion",
                    "confidence": 1.0,
                    "bbox": area
                } 
                for area in motion_areas
            ],
            "motion_areas": motion_areas if motion_detected else []
        }
        detection_collection.insert_one(frame_data)
        
        if motion_detected:
            all_motion_events.append((frame_number, timestamp, motion_areas))
        
        frame_number += 1
    
    cap.release()
    
    # Create timeline for motion events
    timeline = create_motion_timeline(job.id, video.id, all_motion_events, fps, frame_count)
    
    # Store timeline in MongoDB
    timeline_collection = db_mongo["timelines"]
    timeline_collection.insert_one(timeline)

def create_detection_timeline(
    job_id: int, 
    video_id: int, 
    all_detections: List[List[Dict[str, Any]]], 
    fps: float, 
    frame_count: int
) -> Dict[str, Any]:
    """
    Create a timeline of detection events.
    
    Args:
        job_id: Detection job ID
        video_id: Video ID
        all_detections: List of all detections per frame
        fps: Frames per second
        frame_count: Total number of frames
        
    Returns:
        Timeline data
    """
    # Initialize tracking
    object_tracks = {}  # track_id -> list of detections
    next_track_id = 1
    
    # Process each frame
    for frame_number, detections in enumerate(all_detections):
        timestamp = frame_number / fps
        
        for detection in detections:
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            bbox = detection["bbox"]
            
            # Simple tracking: assign new objects to existing tracks based on IoU
            matched = False
            
            for track_id, track_data in object_tracks.items():
                # Only match with same class
                if track_data["class_name"] != class_name:
                    continue
                
                # Only consider active tracks (seen in recent frames)
                if frame_number - track_data["last_frame"] > 10:  # 10 frame gap threshold
                    continue
                
                # Check if bounding boxes overlap (simple IoU check)
                last_bbox = track_data["last_bbox"]
                if calculate_iou(bbox, last_bbox) > 0.5:  # 50% IoU threshold
                    # Update existing track
                    track_data["detections"].append({
                        "frame": frame_number,
                        "time": timestamp,
                        "bbox": bbox,
                        "confidence": confidence
                    })
                    track_data["last_frame"] = frame_number
                    track_data["last_bbox"] = bbox
                    track_data["max_confidence"] = max(track_data["max_confidence"], confidence)
                    matched = True
                    break
            
            if not matched:
                # Create new track
                object_tracks[next_track_id] = {
                    "class_name": class_name,
                    "first_frame": frame_number,
                    "last_frame": frame_number,
                    "detections": [{
                        "frame": frame_number,
                        "time": timestamp,
                        "bbox": bbox,
                        "confidence": confidence
                    }],
                    "last_bbox": bbox,
                    "max_confidence": confidence
                }
                next_track_id += 1
    
    # Convert tracks to timeline events
    events = []
    
    for track_id, track_data in object_tracks.items():
        if len(track_data["detections"]) < 3:  # Ignore very short tracks
            continue
        
        first_detection = track_data["detections"][0]
        last_detection = track_data["detections"][-1]
        
        events.append({
            "type": "object",
            "class_name": track_data["class_name"],
            "track_id": track_id,
            "start_time": first_detection["time"],
            "end_time": last_detection["time"],
            "first_frame": track_data["first_frame"],
            "last_frame": track_data["last_frame"],
            "confidence": track_data["max_confidence"]
        })
    
    # Sort events by start time
    events.sort(key=lambda e: e["start_time"])
    
    return {
        "job_id": job_id,
        "video_id": video_id,
        "events": events
    }

def create_motion_timeline(
    job_id: int, 
    video_id: int, 
    motion_events: List[Tuple[int, float, List[List[float]]]], 
    fps: float, 
    frame_count: int
) -> Dict[str, Any]:
    """
    Create a timeline of motion events.
    
    Args:
        job_id: Detection job ID
        video_id: Video ID
        motion_events: List of motion events (frame_number, timestamp, areas)
        fps: Frames per second
        frame_count: Total number of frames
        
    Returns:
        Timeline data
    """
    # Group consecutive motion frames into events
    events = []
    
    if not motion_events:
        return {
            "job_id": job_id,
            "video_id": video_id,
            "events": []
        }
    
    # Initialize with first event
    current_event = {
        "type": "motion",
        "class_name": "motion",
        "track_id": 1,  # All motion gets track_id 1
        "start_time": motion_events[0][1],
        "end_time": motion_events[0][1],
        "first_frame": motion_events[0][0],
        "last_frame": motion_events[0][0],
        "confidence": 1.0
    }
    
    # Process remaining events
    for i in range(1, len(motion_events)):
        frame_number, timestamp, _ = motion_events[i]
        prev_frame = motion_events[i-1][0]
        
        # If this frame is consecutive with previous or within 1 second
        if frame_number <= prev_frame + max(fps, 10):  # Allow 1 second or 10 frames gap
            # Extend current event
            current_event["end_time"] = timestamp
            current_event["last_frame"] = frame_number
        else:
            # Finish current event and start new one
            events.append(current_event)
            current_event = {
                "type": "motion",
                "class_name": "motion",
                "track_id": 1,  # All motion gets track_id 1
                "start_time": timestamp,
                "end_time": timestamp,
                "first_frame": frame_number,
                "last_frame": frame_number,
                "confidence": 1.0
            }
    
    # Add final event
    events.append(current_event)
    
    return {
        "job_id": job_id,
        "video_id": video_id,
        "events": events
    }

def calculate_iou(bbox1: List[float], bbox2: List[float]) -> float:
    """
    Calculate Intersection over Union (IoU) for two bounding boxes.
    
    Args:
        bbox1, bbox2: Bounding boxes in format [x, y, width, height]
        
    Returns:
        IoU value (0.0 to 1.0)
    """
    # Convert to xmin, ymin, xmax, ymax format
    x1_1, y1_1, w1, h1 = bbox1
    x2_1, y2_1, w2, h2 = bbox2
    
    x1_2 = x1_1 + w1
    y1_2 = y1_1 + h1
    x2_2 = x2_1 + w2
    y2_2 = y2_1 + h2
    
    # Calculate intersection area
    x_left = max(x1_1, x2_1)
    y_top = max(y1_1, y2_1)
    x_right = min(x1_2, x2_2)
    y_bottom = min(y1_2, y2_2)
    
    if x_right < x_left or y_bottom < y_top:
        return 0.0
    
    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    
    # Calculate union area
    bbox1_area = w1 * h1
    bbox2_area = w2 * h2
    union_area = bbox1_area + bbox2_area - intersection_area
    
    # Calculate IoU
    if union_area == 0:
        return 0.0
    
    return intersection_area / union_area