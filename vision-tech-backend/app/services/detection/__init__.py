# app/services/detection/__init__.py
import datetime
from sqlalchemy.orm import Session

from app.models.detection import DetectionJob
from app.tasks.detection import start_detection_job as _start_detection_task

def start_detection_job(db: Session, job_id: int) -> None:
    """
    Start a detection job in the background.
    
    This function updates the job status and calls the actual background task.
    
    Args:
        db: Database session
        job_id: ID of the detection job to start
    """
    # Start the detection job in the background
    _start_detection_task(db, job_id)