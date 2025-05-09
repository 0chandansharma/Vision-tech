# app/schemas/detection.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: List[float] = Field(..., description="Bounding box coordinates [x, y, width, height]")
    track_id: Optional[int] = None

class FrameDetections(BaseModel):
    job_id: int
    video_id: int
    frame_number: int
    timestamp: float
    detections: List[Detection]
    motion_areas: Optional[List[List[float]]] = None

class TimelineEvent(BaseModel):
    type: str
    class_name: str
    track_id: int
    start_time: float
    end_time: float
    first_frame: int
    last_frame: int
    confidence: float

class Timeline(BaseModel):
    job_id: int
    video_id: int
    events: List[TimelineEvent]

class DetectionJobBase(BaseModel):
    model_name: str
    parameters: Optional[Dict[str, Any]] = None

class DetectionJobCreate(DetectionJobBase):
    pass

class DetectionJob(DetectionJobBase):
    id: int
    video_id: int
    status: str
    created_by: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True

class DetectionJobWithDetails(DetectionJob):
    video: Dict[str, Any]
    creator: Dict[str, Any]