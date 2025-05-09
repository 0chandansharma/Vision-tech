# app/db/base.py
# Import all models here for Alembic
from app.db.base_class import Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.video import Video
# from app.models.detection_job import DetectionJob
# from app.models.usage_log import UsageLog