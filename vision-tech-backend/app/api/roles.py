# app/api/roles.py
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=List[RoleSchema])
def read_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve roles. Only admins can access.
    """
    roles = db.query(Role).offset(skip).limit(limit).all()
    return roles


@router.post("/", response_model=RoleSchema)
def create_role(
    *,
    db: Session = Depends(get_db),
    role_in: RoleCreate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Create new role. Only admins can create roles.
    """
    # Check if role with given name exists
    role = db.query(Role).filter(Role.name == role_in.name).first()
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists",
        )
    
    # Create role
    role = Role(
        name=role_in.name,
        permissions=role_in.permissions,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.get("/{role_id}", response_model=RoleSchema)
def read_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Get role by ID. Only admins can access.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    return role


@router.put("/{role_id}", response_model=RoleSchema)
def update_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    role_in: RoleUpdate,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Update a role. Only admins can update roles.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    
    # Don't allow updating admin role name
    if role.name == "admin" and role_in.name and role_in.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change admin role name",
        )
    
    # Update role fields
    update_data = role_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Delete a role. Only admins can delete roles.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    
    # Don't allow deleting default roles
    if role.name in ["admin", "police", "engineer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete default role: {role.name}",
        )
    
    # Check if role is being used by any users
    users_with_role = db.query(User).filter(User.role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role with {users_with_role} users assigned",
        )
    
    db.delete(role)
    db.commit()
    
    return None