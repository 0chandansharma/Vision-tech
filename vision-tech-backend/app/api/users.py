# app/api/users.py
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_admin_user
from app.core.security import get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import (
    User as UserSchema,
    UserCreate,
    UserUpdate,
    UserWithRole,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserWithRole])
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users. Only admins can access.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    
    # Add role information to each user
    result = []
    for user in users:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        user_dict = {
            **UserSchema.from_orm(user).dict(),
            "role": {
                "id": role.id,
                "name": role.name,
                "permissions": role.permissions
            }
        }
        result.append(user_dict)
    
    return result


@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Create new user. Only admins can create users.
    """
    # Check if user with given username or email exists
    user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )
    
    # Check if role exists
    role = db.query(Role).filter(Role.id == user_in.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role not found",
        )
    
    # Create user
    user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role_id=user_in.role_id,
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserWithRole)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    # Add role information
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    user_dict = {
        **UserSchema.from_orm(current_user).dict(),
        "role": {
            "id": role.id,
            "name": role.name,
            "permissions": role.permissions
        }
    }
    
    return user_dict


@router.get("/{user_id}", response_model=UserWithRole)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific user by id.
    """
    # Only admin users can access other users
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this user",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Add role information
    role = db.query(Role).filter(Role.id == user.role_id).first()
    user_dict = {
        **UserSchema.from_orm(user).dict(),
        "role": {
            "id": role.id,
            "name": role.name,
            "permissions": role.permissions
        }
    }
    
    return user_dict


@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a user.
    """
    # Only admin users can update other users
    is_admin = current_user.role and current_user.role.name == "admin"
    
    if not is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check for role update (only admins can update roles)
    if user_in.role_id is not None and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update role",
        )
    
    # Check if role exists when updating role
    if user_in.role_id is not None:
        role = db.query(Role).filter(Role.id == user_in.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role not found",
            )
    
    # Update user fields
    update_data = user_in.dict(exclude_unset=True)
    
    # Handle password update
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["password_hash"] = hashed_password
    
    # Update other fields
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Delete a user. Only admins can delete users.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user account",
        )
    
    db.delete(user)
    db.commit()
    
    return None