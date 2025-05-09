# app/schemas/video.py
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


# Base Video schema
class VideoBase(BaseModel):
    project_id: int
    original_filename: str


# Schema for creating a Video
class VideoCreate(VideoBase):
    pass


# Schema for Video in response
class Video(VideoBase):
    id: int
    filename: str
    file_path: str
    file_size: int
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    format: Optional[str] = None
    uploaded_by: int
    uploaded_at: datetime
    processing_status: str

    class Config:
        orm_mode = True


# Schema for Video with additional details
class VideoWithDetails(Video):
    project: Dict[str, Any]
    uploader: Dict[str, Any]


# Schema for updating a Video
class VideoUpdate(BaseModel):
    project_id: Optional[int] = None
    original_filename: Optional[str] = None
    processing_status: Optional[str] = None
    
    class Config:
        orm_mode = True