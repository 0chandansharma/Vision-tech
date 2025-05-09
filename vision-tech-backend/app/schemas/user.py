# app/schemas/user.py
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    role_id: int


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None


class UserInDBBase(UserBase):
    id: int
    role_id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserWithRole(User):
    role: Dict[str, Any]


# app/schemas/token.py
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# app/schemas/project.py
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str
    case_number: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    case_number: Optional[str] = None
    description: Optional[str] = None
    is_archived: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class ProjectInDBBase(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        orm_mode = True


class Project(ProjectInDBBase):
    pass


class ProjectWithDetails(Project):
    creator: Dict[str, Any]
    video_count: int


class ProjectMemberBase(BaseModel):
    role: str


class ProjectMemberCreate(ProjectMemberBase):
    user_id: int


class ProjectMember(ProjectMemberBase):
    project_id: int
    user_id: int
    added_at: datetime

    class Config:
        orm_mode = True


# app/schemas/video.py
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class VideoBase(BaseModel):
    project_id: int
    original_filename: str


class VideoCreate(VideoBase):
    filename: str
    file_path: str
    file_size: int


class VideoUpdate(BaseModel):
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    format: Optional[str] = None
    processing_status: Optional[str] = None


class VideoInDBBase(VideoBase):
    id: int
    filename: str
    file_path: str
    file_size: int
    uploaded_by: int
    uploaded_at: datetime
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    format: Optional[str] = None
    processing_status: str

    class Config:
        orm_mode = True


class Video(VideoInDBBase):
    pass


class VideoWithDetails(Video):
    project: Dict[str, Any]
    uploader: Dict[str, Any]
    detection_jobs_count: int


# app/schemas/detection.py
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class DetectionJobBase(BaseModel):
    video_id: int
    model_name: str
    parameters: Optional[Dict[str, Any]] = None


class DetectionJobCreate(DetectionJobBase):
    pass


class DetectionJobUpdate(BaseModel):
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class DetectionJobInDBBase(DetectionJobBase):
    id: int
    created_by: int
    created_at: datetime
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True


class DetectionJob(DetectionJobInDBBase):
    pass


class DetectionJobWithDetails(DetectionJob):
    video: Dict[str, Any]
    creator: Dict[str, Any]


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: List[float]  # [x, y, width, height]
    track_id: Optional[int] = None


class FrameDetections(BaseModel):
    job_id: int
    video_id: int
    frame_number: int
    timestamp: float
    detections: List[Detection]
    motion_areas: Optional[List[List[float]]] = None


class TimelineEvent(BaseModel):
    type: str  # object_appeared, object_disappeared
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