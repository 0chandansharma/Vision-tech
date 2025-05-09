# app/api/videos.py
import os
import shutil
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.models.video import Video
from app.models.detection import DetectionJob  # Updated import
from app.schemas.video import (
    Video as VideoSchema,
    VideoCreate,
    VideoUpdate,
    VideoWithDetails,
)
from app.services.video import extract_video_metadata

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/project/{project_id}", response_model=List[VideoWithDetails])
def get_videos_by_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all videos in a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has access to this project
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this project",
            )
    
    # Get videos
    videos = db.query(Video).filter(Video.project_id == project_id).offset(skip).limit(limit).all()
    
    # Add project, uploader, and detection job count information
    result = []
    for video in videos:
        uploader = db.query(User).filter(User.id == video.uploaded_by).first()
        detection_jobs_count = db.query(func.count(DetectionJob.id)) \
            .filter(DetectionJob.video_id == video.id).scalar()
        
        video_dict = {
            **VideoSchema.from_orm(video).dict(),
            "project": {
                "id": project.id,
                "name": project.name,
                "case_number": project.case_number,
            },
            "uploader": {
                "id": uploader.id,
                "username": uploader.username,
                "first_name": uploader.first_name,
                "last_name": uploader.last_name
            },
            "detection_jobs_count": detection_jobs_count
        }
        result.append(video_dict)
    
    return result


@router.post("/project/{project_id}/upload", response_model=VideoSchema)
async def upload_video(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload a video to a project.
    """
    # Check if the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has access to this project
    is_admin = current_user.role and current_user.role.name == "admin"
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to upload to this project",
            )
    
    # Check file size
    # WARNING: This is not very efficient for large files as it reads the entire file into memory
    # In a production environment, use chunked uploads or check Content-Length header
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum file size is {settings.MAX_UPLOAD_SIZE / 1_000_000} MB",
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
    if file_ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type not supported. Allowed types: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}",
        )
    
    # Create storage directory if it doesn't exist
    storage_path = os.path.join(settings.LOCAL_STORAGE_PATH, "videos", str(project_id))
    os.makedirs(storage_path, exist_ok=True)
    
    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(storage_path, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create the video record
    video = Video(
        project_id=project_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        uploaded_by=current_user.id,
        processing_status="processing"
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Extract metadata in the background
    background_tasks.add_task(extract_video_metadata, db, video.id)
    
    return video


@router.get("/{video_id}", response_model=VideoWithDetails)
def get_video(
    *,
    db: Session = Depends(get_db),
    video_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific video by ID.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the video
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    
    # Get the project
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has access to this video's project
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
    
    # Get uploader info
    uploader = db.query(User).filter(User.id == video.uploaded_by).first()
    
    # Get detection job count
    detection_jobs_count = db.query(func.count(DetectionJob.id)) \
        .filter(DetectionJob.video_id == video.id).scalar()
    
    # Create response
    video_dict = {
        **VideoSchema.from_orm(video).dict(),
        "project": {
            "id": project.id,
            "name": project.name,
            "case_number": project.case_number,
        },
        "uploader": {
            "id": uploader.id,
            "username": uploader.username,
            "first_name": uploader.first_name,
            "last_name": uploader.last_name
        },
        "detection_jobs_count": detection_jobs_count
    }
    
    return video_dict


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    *,
    db: Session = Depends(get_db),
    video_id: int,
    current_user: User = Depends(get_current_user),
) -> Response:
    """
    Delete a video.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the video
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    
    # Get the project
    project = db.query(Project).filter(Project.id == video.project_id).first()
    
    # Check if user has permission to delete this video
    if not is_admin and project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this video",
        )
    
    # Delete the file
    if os.path.exists(video.file_path):
        os.remove(video.file_path)
    
    # Delete the video record
    db.delete(video)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)