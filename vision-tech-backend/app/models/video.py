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
    uploader = relationship("User")
    detection_jobs = relationship("DetectionJob", back_populates="video")