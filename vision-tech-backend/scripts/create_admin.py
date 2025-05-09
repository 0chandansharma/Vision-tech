# scripts/create_admin.py
import os
import sys
import argparse
from sqlalchemy.orm import Session

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role

def create_admin(
    db: Session,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> None:
    """Create an admin user."""
    # Check if admin role exists
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        print("Admin role not found. Please run init_db.py first.")
        return
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        print(f"User with username '{username}' or email '{email}' already exists.")
        return
    
    # Create admin user
    admin_user = User(
        username=username,
        email=email,
        password_hash=get_password_hash(password),
        first_name=first_name,
        last_name=last_name,
        role_id=admin_role.id,
        is_active=True,
    )
    
    db.add(admin_user)
    db.commit()
    
    print(f"Admin user '{username}' created successfully.")

def main() -> None:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--username", required=True, help="Admin username")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--first-name", required=True, help="Admin first name")
    parser.add_argument("--last-name", required=True, help="Admin last name")
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        create_admin(
            db=db,
            username=args.username,
            email=args.email,
            password=args.password,
            first_name=args.first_name,
            last_name=args.last_name,
        )
    finally:
        db.close()

if __name__ == "__main__":
    main()