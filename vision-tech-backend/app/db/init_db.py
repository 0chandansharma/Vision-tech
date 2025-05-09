# app/db/init_db.py
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Import all models through the base to ensure they're registered
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session = None) -> None:
    """
    Initialize the database with tables and default data.
    
    Args:
        db: Optional database session. If not provided, a new session will be created.
    """
    logger.info("Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully!")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        raise
    
    # Create a new session if one wasn't provided
    if not db:
        db = SessionLocal()
    
    try:
        # Create default roles if they don't exist
        create_default_roles(db)
        
        # Create default admin user if it doesn't exist
        create_default_admin(db)
        
        logger.info("Database initialization completed successfully")
    except SQLAlchemyError as e:
        logger.error(f"Error initializing database data: {e}")
        raise
    finally:
        if db:
            db.close()

def create_default_roles(db: Session) -> None:
    """
    Create default roles if they don't exist.
    
    Args:
        db: Database session
    """
    logger.info("Creating default roles...")
    
    # Admin role
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        logger.info("Creating admin role")
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
        db.commit()
        db.refresh(admin_role)
    
    # Police role
    police_role = db.query(Role).filter(Role.name == "police").first()
    if not police_role:
        logger.info("Creating police role")
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
        db.commit()
        db.refresh(police_role)
    
    # Engineer role
    engineer_role = db.query(Role).filter(Role.name == "engineer").first()
    if not engineer_role:
        logger.info("Creating engineer role")
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
        db.refresh(engineer_role)
    
    logger.info("Default roles created successfully")

def create_default_admin(db: Session) -> None:
    """
    Create default admin user if it doesn't exist.
    
    Args:
        db: Database session
    """
    logger.info("Checking for default admin user...")
    
    # Get admin role
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        logger.error("Admin role not found. Cannot create admin user.")
        return
    
    # Check if admin user exists
    admin = db.query(User).filter(User.email == "admin@visiontech.com").first()
    if not admin:
        logger.info("Creating default admin user")
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
        logger.info("Default admin user created successfully")
    else:
        logger.info("Default admin user already exists")