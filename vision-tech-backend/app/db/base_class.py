# app/db/base_class.py
from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically based on class name
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, 
    pool_pre_ping=True,
    echo=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# app/db/init_db.py
from sqlalchemy.orm import Session

from app.db import base  # noqa: F401
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role

# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.video import Video
from app.models.detection_job import DetectionJob


def init_db(db: Session) -> None:
    # Create default roles if they don't exist
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        admin_role = Role(
            name="admin",
            permissions={
                "users_create": True,
                "users_read": True,
                "users_update": True,
                "users_delete": True,
                "all_projects": True,
            },
        )
        db.add(admin_role)
    
    police_role = db.query(Role).filter(Role.name == "police").first()
    if not police_role:
        police_role = Role(
            name="police",
            permissions={
                "own_projects_create": True,
                "own_projects_read": True,
                "own_projects_update": True,
                "shared_projects_read": True,
            },
        )
        db.add(police_role)
    
    engineer_role = db.query(Role).filter(Role.name == "engineer").first()
    if not engineer_role:
        engineer_role = Role(
            name="engineer",
            permissions={
                "models_create": True,
                "models_update": True,
                "annotations_create": True,
                "annotations_update": True,
            },
        )
        db.add(engineer_role)
    
    db.commit()
    
    # Create a default admin user if it doesn't exist
    admin = db.query(User).filter(User.email == "admin@visiontech.com").first()
    if not admin:
        admin = User(
            email="admin@visiontech.com",
            username="admin",
            first_name="Admin",
            last_name="User",
            password_hash=get_password_hash("adminpassword"),
            is_active=True,
            role_id=admin_role.id,
        )
        db.add(admin)
        db.commit()