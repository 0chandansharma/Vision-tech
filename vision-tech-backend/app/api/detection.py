# app/api/detection.py
import os
from typing import Any, List, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query, Response, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pymongo import MongoClient
from bson.objectid import ObjectId

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.models.video import Video
from app.models.detection import DetectionJob  # Updated import
from app.models.usage_log import UsageLog
from app.schemas.detection import (
    DetectionJob as DetectionJobSchema,
    DetectionJobCreate,
    DetectionJobWithDetails,
    Detection,
    FrameDetections,
    Timeline,
    TimelineEvent,
)
from app.services.detection import start_detection_job

router = APIRouter(prefix="/detection", tags=["detection"])


@router.get("/models", response_model=List[Dict[str, Any]])
def get_available_models(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a list of available detection models.
    """
    # Log usage
    db = next(get_db())
    log = UsageLog(
        user_id=current_user.id,
        resource_type="models",
        action="list",
        details={"endpoint": "/detection/models"}
    )
    db.add(log)
    db.commit()
    
    # In a real application, this would come from a database or model registry
    available_models = [
        {
            "id": "yolov8n",
            "name": "YOLO v8 Nano",
            "type": "object_detection",
            "description": "Lightweight object detection model",
            "classes": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", 
                        "train", "truck", "boat", "traffic light", "fire hydrant", 
                        "stop sign", "parking meter", "bench", "bird", "cat", "dog", 
                        "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", 
                        "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee"]
        },
        {
            "id": "yolov8s",
            "name": "YOLO v8 Small",
            "type": "object_detection",
            "description": "Balance of speed and accuracy for object detection",
            "classes": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", 
                        "train", "truck", "boat", "traffic light", "fire hydrant", 
                        "stop sign", "parking meter", "bench", "bird", "cat", "dog"]
        },
        {
            "id": "motion_detection",
            "name": "Motion Detection",
            "type": "motion_detection",
            "description": "Detects movement in video using background subtraction",
            "classes": ["motion"]
        },
    ]
    
    return available_models


@router.post("/videos/{video_id}/jobs", response_model=DetectionJobSchema)
def create_detection_job(
    *,
    db: Session = Depends(get_db),
    video_id: int,
    job_in: DetectionJobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new detection job for a video.
    """
    # Get the video
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    
    # Check if video is ready for processing
    if video.processing_status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video is not ready for processing",
        )
    
    # Check if user has access to this video's project
    is_admin = current_user.role and current_user.role.name == "admin"
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to process this video",
            )
    
    # Create the detection job
    job = DetectionJob(
        video_id=video_id,
        model_name=job_in.model_name,
        parameters=job_in.parameters,
        status="pending",
        created_by=current_user.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="detection_job",
        resource_id=job.id,
        action="create",
        details={
            "video_id": video_id,
            "model_name": job_in.model_name
        }
    )
    db.add(log)
    db.commit()
    
    # Start the detection job in the background
    background_tasks.add_task(start_detection_job, db, job.id)
    
    return job


@router.get("/jobs/{job_id}", response_model=DetectionJobWithDetails)
def get_detection_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific detection job by ID.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Get creator info
    creator = db.query(User).filter(User.id == job.created_by).first()
    
    # Create response
    job_dict = {
        **DetectionJobSchema.from_orm(job).dict(),
        "video": {
            "id": video.id,
            "filename": video.filename,
            "original_filename": video.original_filename,
            "duration": video.duration,
        },
        "creator": {
            "id": creator.id,
            "username": creator.username,
            "first_name": creator.first_name,
            "last_name": creator.last_name
        }
    }
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="detection_job",
        resource_id=job.id,
        action="read",
        details={"job_id": job_id}
    )
    db.add(log)
    db.commit()
    
    return job_dict


@router.get("/videos/{video_id}/jobs", response_model=List[DetectionJobSchema])
def get_detection_jobs_for_video(
    *,
    db: Session = Depends(get_db),
    video_id: int,
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all detection jobs for a video.
    """
    # Get the video
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    
    # Check if user has access to this video's project
    is_admin = current_user.role and current_user.role.name == "admin"
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this video",
            )
    
    # Get detection jobs
    jobs = db.query(DetectionJob) \
        .filter(DetectionJob.video_id == video_id) \
        .order_by(DetectionJob.created_at.desc()) \
        .offset(skip).limit(limit).all()
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="detection_job",
        action="list",
        details={"video_id": video_id}
    )
    db.add(log)
    db.commit()
    
    return jobs


@router.get("/jobs/{job_id}/frames", response_model=List[FrameDetections])
def get_detection_frames(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    start_time: Optional[float] = None,
    end_time: Optional[float] = None,
) -> Any:
    """
    Get detection results for a job.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Check if job is completed
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection job is not completed. Current status: {job.status}",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Connect to MongoDB to get detection results
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["detection_results"]
    
    # Build query
    query = {"job_id": job_id}
    
    # Add time range filter if provided
    if start_time is not None or end_time is not None:
        query["timestamp"] = {}
        if start_time is not None:
            query["timestamp"]["$gte"] = start_time
        if end_time is not None:
            query["timestamp"]["$lte"] = end_time
    
    # Get detection frames
    frames = list(collection.find(query).skip(skip).limit(limit).sort("frame_number", 1))
    
    # Convert ObjectId to string
    for frame in frames:
        frame["_id"] = str(frame["_id"])
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="detection_frames",
        action="read",
        details={
            "job_id": job_id, 
            "skip": skip, 
            "limit": limit,
            "start_time": start_time,
            "end_time": end_time
        }
    )
    db.add(log)
    db.commit()
    
    return frames


@router.get("/jobs/{job_id}/timeline", response_model=Timeline)
def get_detection_timeline(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get timeline of detection events for a job.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Check if job is completed
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection job is not completed. Current status: {job.status}",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Connect to MongoDB to get timeline
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["timelines"]
    
    # Get timeline
    timeline = collection.find_one({"job_id": job_id})
    
    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline not found",
        )
    
    # Convert ObjectId to string
    timeline["_id"] = str(timeline["_id"])
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="timeline",
        action="read",
        details={"job_id": job_id}
    )
    db.add(log)
    db.commit()
    
    return timeline


@router.get("/jobs/{job_id}/objects", response_model=List[Dict[str, Any]])
def get_detected_objects(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
    class_name: Optional[str] = None,
    min_confidence: float = 0.5,
    limit: int = 20,
) -> Any:
    """
    Get thumbnails of detected objects for a job.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Check if job is completed
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection job is not completed. Current status: {job.status}",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Connect to MongoDB to get detected objects
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["object_thumbnails"]
    
    # Build query
    query = {
        "job_id": job_id,
        "confidence": {"$gte": min_confidence}
    }
    
    if class_name:
        query["class_name"] = class_name
    
    # Get object thumbnails
    objects = list(collection.find(query).limit(limit).sort("confidence", -1))
    
    # Convert ObjectId to string
    for obj in objects:
        obj["_id"] = str(obj["_id"])
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="objects",
        action="read",
        details={
            "job_id": job_id,
            "class_name": class_name,
            "min_confidence": min_confidence
        }
    )
    db.add(log)
    db.commit()
    
    return objects


@router.get("/thumbnails/{job_id}/{filename}")
def get_detection_thumbnail(
    *,
    job_id: int,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a thumbnail image for a detected object.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Construct thumbnail path
    thumbnail_path = os.path.join(
        settings.LOCAL_STORAGE_PATH,
        "thumbnails",
        f"{job_id}_{filename}"
    )
    
    # Check if file exists
    if not os.path.exists(thumbnail_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thumbnail not found",
        )
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="thumbnail",
        action="read",
        details={
            "job_id": job_id,
            "filename": filename
        }
    )
    db.add(log)
    db.commit()
    
    # Return the file
    return FileResponse(thumbnail_path)


@router.post("/jobs/{job_id}/export", response_model=Dict[str, Any])
def export_detection_results(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
    format: str = Query(..., description="Export format (json, csv, video)"),
) -> Any:
    """
    Export detection results in various formats.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Check if job is completed
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection job is not completed. Current status: {job.status}",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Check if format is valid
    valid_formats = ["json", "csv", "video"]
    if format not in valid_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format. Supported formats: {', '.join(valid_formats)}",
        )
    
    # In a real application, this would generate the export file
    # For this example, we'll just return a success response with a mock download URL
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="export",
        action="create",
        details={
            "job_id": job_id,
            "format": format
        }
    )
    db.add(log)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Export initiated in {format} format",
        "download_url": f"/api/v1/detection/jobs/{job_id}/download?format={format}",
    }


@router.get("/jobs/{job_id}/download")
def download_export(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(get_current_user),
    format: str = Query(..., description="Export format (json, csv, video)"),
) -> Any:
    """
    Download exported detection results.
    """
    # Get the job
    job = db.query(DetectionJob).filter(DetectionJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection job not found",
        )
    
    # Check if job is completed
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection job is not completed. Current status: {job.status}",
        )
    
    # Get the video and project
    video = db.query(Video).filter(Video.id == job.video_id).first()
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this job's video project
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == video.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job",
            )
    
    # Check if format is valid
    valid_formats = ["json", "csv", "video"]
    if format not in valid_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format. Supported formats: {', '.join(valid_formats)}",
        )
    
    # In a real application, this would fetch the generated export file
    # For this example, we'll just return a mock file
    
    # Connect to MongoDB to get detection results
    mongo_client = MongoClient(settings.MONGODB_URL)
    db_mongo = mongo_client[settings.MONGODB_DB]
    collection = db_mongo["detection_results"]
    
    # Get all detections for the job
    detections = list(collection.find({"job_id": job_id}).sort("frame_number", 1))
    
    # Convert ObjectId to string
    for detection in detections:
        detection["_id"] = str(detection["_id"])
    
    # Log usage
    log = UsageLog(
        user_id=current_user.id,
        resource_type="download",
        action="read",
        details={
            "job_id": job_id,
            "format": format
        }
    )
    db.add(log)
    db.commit()
    
    # Handle different export formats
    if format == "json":
        # Return JSON response
        return detections
    
    elif format == "csv":
        # Generate CSV content
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "frame_number", "timestamp", "class_name", 
            "confidence", "x", "y", "width", "height"
        ])
        
        # Write data
        for detection in detections:
            frame_number = detection["frame_number"]
            timestamp = detection["timestamp"]
            
            for obj in detection.get("detections", []):
                writer.writerow([
                    frame_number,
                    timestamp,
                    obj["class_name"],
                    obj["confidence"],
                    obj["bbox"][0],  # x
                    obj["bbox"][1],  # y
                    obj["bbox"][2],  # width
                    obj["bbox"][3],  # height
                ])
        
        # Return CSV response
        content = output.getvalue()
        output.close()
        
        response = Response(content=content, media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=detection_job_{job_id}.csv"
        return response
    
    elif format == "video":
        # In a real implementation, this would generate a video with annotations
        # For now, just return an error that this feature is not implemented
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Video export is not yet implemented",
        )


@router.post("/test-yolo", response_model=Dict[str, Any])
async def test_yolo(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    model: str = Query("yolov8n", description="Model name"),
    conf: float = Query(0.25, description="Confidence threshold"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Test YOLO detection on an image.
    """
    try:
        # Ensure user has permissions
        is_admin = current_user.role and current_user.role.name == "admin"
        is_engineer = current_user.role and current_user.role.name == "engineer"
        
        if not (is_admin or is_engineer):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        
        # Read image content
        content = await file.read()
        import numpy as np
        import cv2
        from app.services.detection.yolo import YOLODetector
        
        # Convert to numpy array
        nparr = np.frombuffer(content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file",
            )
        
        # Initialize YOLO detector
        model_path = os.path.join(settings.LOCAL_STORAGE_PATH, "models", f"{model}.pt")
        if not os.path.exists(model_path):
            model_path = f"{model}.pt"  # Use default model from ultralytics
            
        detector = YOLODetector(model_path)
        
        # Perform detection
        detections, _ = detector.detect(img, conf_threshold=conf)
        
        # Log usage
        log = UsageLog(
            user_id=current_user.id,
            resource_type="test_yolo",
            action="create",
            details={
                "model": model,
                "conf": conf,
                "filename": file.filename
            }
        )
        db.add(log)
        db.commit()
        
        # Return detections
        return {
            "status": "success",
            "model": model,
            "detections": detections,
            "count": len(detections)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}",
        )