# app/models/role.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func

from app.db.base_class import Base



class Role(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    permissions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role_id = Column(Integer, ForeignKey("role.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    role = relationship("Role")
    projects = relationship("Project", back_populates="creator")
    videos = relationship("Video", back_populates="uploader")


# app/models/project.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    case_number = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_archived = Column(Boolean, default=False)
    metadata = Column(JSON, nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="projects")
    videos = relationship("Video", back_populates="project")
    members = relationship("ProjectMember", back_populates="project")


class ProjectMember(Base):
    __tablename__ = "project_member"
    
    project_id = Column(Integer, ForeignKey("project.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    role = Column(String(50), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User")


# app/models/video.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Video(Base):
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    format = Column(String(50), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processing_status = Column(String(50), default="pending")
    
    # Relationships
    project = relationship("Project", back_populates="videos")
    uploader = relationship("User", back_populates="videos")
    detection_jobs = relationship("DetectionJob", back_populates="video")


# app/models/detection_job.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class DetectionJob(Base):
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("video.id"), nullable=False)
    model_name = Column(String(100), nullable=False)
    parameters = Column(JSON, nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    video = relationship("Video", back_populates="detection_jobs")
    creator = relationship("User")


# app/models/usage_log.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.sql import func

from app.db.base_class import Base


class UsageLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer, nullable=True)
    action = Column(String(50), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processing_time = Column(Float, nullable=True)