# app/schemas/project.py
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


# Base Project schema
class ProjectBase(BaseModel):
    name: str
    case_number: str
    description: Optional[str] = None
    is_archived: bool = False
    project_metadata: Optional[Dict[str, Any]] = None


# Schema for creating a Project
class ProjectCreate(ProjectBase):
    pass


# Schema for updating a Project
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    case_number: Optional[str] = None
    description: Optional[str] = None
    is_archived: Optional[bool] = None
    project_metadata: Optional[Dict[str, Any]] = None


# Schema for Project in response
class Project(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Schema for Project with additional details
class ProjectWithDetails(Project):
    creator: Dict[str, Any]
    video_count: int


# Schema for ProjectMember
class ProjectMemberBase(BaseModel):
    user_id: int
    role: str


# Schema for creating a ProjectMember
class ProjectMemberCreate(ProjectMemberBase):
    pass


# Schema for ProjectMember in response
class ProjectMember(ProjectMemberBase):
    project_id: int
    added_at: datetime

    class Config:
        orm_mode = True