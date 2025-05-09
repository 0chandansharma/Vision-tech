# app/db/base.py
# Import all models here for Alembic

# First import the Base class itself
from app.db.base_class import Base

# Then import the models that use Base
# Import them in order that avoids circular imports
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.video import Video
from app.models.detection import DetectionJob