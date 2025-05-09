# app/db/init_db.py
from sqlalchemy.orm import Session
from app.db.base import Base  # Import from base.py which imports all models
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User

def init_db(db: Session = None) -> None:
    """Initialize the database with tables and default data."""
    print("Creating database tables...")
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    if not db:
        db = SessionLocal()
    
    try:
        # Create default roles
        print("Creating default roles...")
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            print("Creating admin role")
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
        
        police_role = db.query(Role).filter(Role.name == "police").first()
        if not police_role:
            print("Creating police role")
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
        
        engineer_role = db.query(Role).filter(Role.name == "engineer").first()
        if not engineer_role:
            print("Creating engineer role")
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
        
        # Create admin user if it doesn't exist
        print("Checking for default admin user...")
        admin = db.query(User).filter(User.email == "admin@visiontech.com").first()
        if not admin:
            print("Creating default admin user")
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
            print("Default admin user created successfully")
        
        print("Database initialization completed")
    finally:
        if db:
            db.close()