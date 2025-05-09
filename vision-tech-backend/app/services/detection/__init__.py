# app/services/detection/__init__.py
import os
import time
import cv2
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from pymongo import MongoClient

from app.core.config import settings
from app.models.detection_job import DetectionJob
from app.models.video import Video
from app.services.detection.motion import detect_motion
from app.services.detection.yolo import YOLODetector

def start_detection_job(db: Session, job_id: int) -> None:
    """
    Start a detection job.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        return
    
    try:
        # Update job status
        job.status = "processing"
        job.started_at = datetime.utcnow()
        db.commit()
        
        # Get the video
        video = db.query(Video).filter(Video.id == job.video_id).first()
        
        # Choose detection method based on model_name
        if job.model_name == "motion_detection":
            process_motion_detection(db, job, video)
        elif job.model_name.startswith("yolo"):
            process_yolo_detection(db, job, video)
        else:
            # Unknown model
            job.status = "error"
            job.error_message = f"Unknown model: {job.model_name}"
            job.completed_at = datetime.utcnow()
            db.commit()
            return
        
        # Update job status to completed
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Generate timeline
        generate_timeline(job_id)
        
    except Exception as e:
        # Update job status to error
        job.status = "error"
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Log the error
        print(f"Error processing detection job {job_id}: {str(e)}")


def process_motion_detection(db: Session, job: DetectionJob, video: Video) -> None:
    """
    Process video with motion detection.
    """
    # Open the video
    cap = cv2.VideoCapture(video.file_path)
    
    # Check if video opened successfully
    if not cap.isOpened():
        raise Exception("Error opening video file")
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Initialize frame counter
    frame_count = 0
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["detection_results"]
    
    # Process frames
    while cap.isOpened():
        # Read frame
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Apply motion detection from your implementation
        motion_detected, motion_areas = detect_motion(frame)
        
        # Store detection results if motion is detected
        if motion_detected:
            timestamp = frame_count / fps
            
            detection_doc = {
                "job_id": job.id,
                "video_id": video.id,
                "frame_number": frame_count,
                "timestamp": timestamp,
                "detections": [],
                "motion_areas": motion_areas
            }
            
            collection.insert_one(detection_doc)
        
        # Increment frame counter
        frame_count += 1
        
        # Update progress every 100 frames
        if frame_count % 100 == 0:
            progress = frame_count / total_frames * 100
            print(f"Processing job {job.id}: {progress:.2f}% complete")
    
    # Release video capture
    cap.release()


def process_yolo_detection(db: Session, job: DetectionJob, video: Video) -> None:
    """
    Process video with YOLO object detection.
    """
    # Initialize YOLO detector
    model_path = os.path.join(settings.LOCAL_STORAGE_PATH, "models", f"{job.model_name}.pt")
    yolo_detector = YOLODetector(model_path)
    
    # Get parameters from job
    conf_threshold = job.parameters.get("conf_threshold", 0.25) if job.parameters else 0.25
    classes = job.parameters.get("classes", None) if job.parameters else None
    
    # Open the video
    cap = cv2.VideoCapture(video.file_path)
    
    # Check if video opened successfully
    if not cap.isOpened():
        raise Exception("Error opening video file")
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Sample frame rate (process every 30 frames)
    sample_rate = 30
    
    # Initialize frame counter
    frame_count = 0
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["detection_results"]
    thumbnails_collection = db_mongo["object_thumbnails"]
    
    # Store model class names for reference
    model_info = {
        "model_name": job.model_name,
        "class_names": yolo_detector.class_names
    }
    
    # Process frames
    while cap.isOpened():
        # Read frame
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Only process every nth frame
        if frame_count % sample_rate == 0:
            # Run YOLO detection
            detections, annotated_frame = yolo_detector.detect(
                frame, 
                conf_threshold=conf_threshold,
                classes=classes
            )
            
            # Store detection results if any objects detected
            if detections:
                timestamp = frame_count / fps
                
                # Store detection results
                detection_doc = {
                    "job_id": job.id,
                    "video_id": video.id,
                    "frame_number": frame_count,
                    "timestamp": timestamp,
                    "detections": detections
                }
                
                result = collection.insert_one(detection_doc)
                
                # Save thumbnails for each detection
                for i, detection in enumerate(detections):
                    bbox = detection["bbox"]
                    x, y, w, h = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
                    
                    # Ensure bbox is within frame boundaries
                    x = max(0, x)
                    y = max(0, y)
                    w = min(width - x, w)
                    h = min(height - y, h)
                    
                    if w > 0 and h > 0:
                        # Extract thumbnail
                        object_img = frame[y:y+h, x:x+w]
                        
                        # Save thumbnail to disk
                        thumbnail_path = os.path.join(
                            settings.LOCAL_STORAGE_PATH, 
                            "thumbnails", 
                            f"{job.id}_{frame_count}_{i}.jpg"
                        )
                        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
                        cv2.imwrite(thumbnail_path, object_img)
                        
                        # Store thumbnail reference
                        thumbnail_doc = {
                            "job_id": job.id,
                            "video_id": video.id,
                            "frame_number": frame_count,
                            "timestamp": timestamp,
                            "class_id": detection["class_id"],
                            "class_name": detection["class_name"],
                            "confidence": detection["confidence"],
                            "bbox": detection["bbox"],
                            "thumbnail_url": f"/api/v1/detection/thumbnails/{job.id}/{frame_count}_{i}"
                        }
                        
                        thumbnails_collection.insert_one(thumbnail_doc)
        
        # Increment frame counter
        frame_count += 1
        
        # Update progress every 100 frames
        if frame_count % 100 == 0:
            progress = frame_count / total_frames * 100
            print(f"Processing job {job.id}: {progress:.2f}% complete")
    
    # Release video capture
    cap.release()


def generate_timeline(job_id: int) -> None:
    """
    Generate a timeline of detection events for a job.
    """
    # Connect to MongoDB
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    detection_collection = db_mongo["detection_results"]
    timeline_collection = db_mongo["timelines"]
    
    # Get all detection frames for the job
    frames = list(detection_collection.find({"job_id": job_id}).sort("frame_number", 1))
    
    if not frames:
        return
    
    # Extract video_id from first frame
    video_id = frames[0]["video_id"]
    
    # Track objects across frames
    tracks = {}  # track_id -> {class_name, frames, etc.}
    
    for frame in frames:
        frame_number = frame["frame_number"]
        timestamp = frame["timestamp"]
        
        # Process detections
        for detection in frame.get("detections", []):
            # Generate a track_id if not present
            if "track_id" not in detection:
                track_id = f"{detection['class_name']}_{len(tracks) + 1}"
            else:
                track_id = detection["track_id"]
                
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            
            if track_id not in tracks:
                # New track
                tracks[track_id] = {
                    "class_name": class_name,
                    "start_time": timestamp,
                    "end_time": timestamp,
                    "first_frame": frame_number,
                    "last_frame": frame_number,
                    "confidence": confidence
                }
            else:
                # Update existing track
                tracks[track_id]["end_time"] = timestamp
                tracks[track_id]["last_frame"] = frame_number
                tracks[track_id]["confidence"] = max(tracks[track_id]["confidence"], confidence)
    
    # Convert tracks to timeline events
    events = []
    
    for track_id, track in tracks.items():
        event = {
            "type": "object_appeared",
            "class_name": track["class_name"],
            "track_id": track_id,
            "start_time": track["start_time"],
            "end_time": track["end_time"],
            "first_frame": track["first_frame"],
            "last_frame": track["last_frame"],
            "confidence": track["confidence"]
        }
        
        events.append(event)
    
    # Store timeline
    timeline_doc = {
        "job_id": job_id,
        "video_id": video_id,
        "events": events
    }
    
    # Remove existing timeline if it exists
    timeline_collection.delete_many({"job_id": job_id})
    
    # Insert new timeline
    timeline_collection.insert_one(timeline_doc)