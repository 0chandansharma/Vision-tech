# app/api/projects.py
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.api.deps import get_current_user, get_current_admin_user
from app.db.session import get_db
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.models.video import Video
from app.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    ProjectWithDetails,
    ProjectMember as ProjectMemberSchema,
    ProjectMemberCreate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectWithDetails])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    archived: Optional[bool] = False,
) -> Any:
    """
    Get all projects accessible to the current user.
    Admin users can see all projects, other users only see their own or shared projects.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    query = db.query(Project)
    
    # Filter by archived status
    query = query.filter(Project.is_archived == archived)
    
    # For non-admin users, filter to only show projects they created or are members of
    if not is_admin:
        query = query.join(
            ProjectMember, 
            (ProjectMember.project_id == Project.id) & (ProjectMember.user_id == current_user.id),
            isouter=True
        ).filter(
            (Project.created_by == current_user.id) | (ProjectMember.user_id == current_user.id)
        )
    
    # Apply pagination
    projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add creator and video count information
    result = []
    for project in projects:
        creator = db.query(User).filter(User.id == project.created_by).first()
        video_count = db.query(func.count(Video.id)).filter(Video.project_id == project.id).scalar()
        
        project_dict = {
            **ProjectSchema.from_orm(project).dict(),
            "creator": {
                "id": creator.id,
                "username": creator.username,
                "first_name": creator.first_name,
                "last_name": creator.last_name
            },
            "video_count": video_count
        }
        result.append(project_dict)
    
    return result


@router.post("/", response_model=ProjectSchema)
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new project.
    """
    project = Project(
        **project_in.dict(),
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectWithDetails)
def get_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific project by ID.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has access to this project
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this project",
            )
    
    # Get creator info
    creator = db.query(User).filter(User.id == project.created_by).first()
    
    # Get video count
    video_count = db.query(func.count(Video.id)).filter(Video.project_id == project.id).scalar()
    
    # Create response
    project_dict = {
        **ProjectSchema.from_orm(project).dict(),
        "creator": {
            "id": creator.id,
            "username": creator.username,
            "first_name": creator.first_name,
            "last_name": creator.last_name
        },
        "video_count": video_count
    }
    
    return project_dict


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has permission to update this project
    if not is_admin and project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this project",
        )
    
    # Update project attributes
    for key, value in project_in.dict(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user: User = Depends(get_current_user),
) -> Response:
    """
    Delete a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has permission to delete this project
    if not is_admin and project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this project",
        )
    
    # Delete the project
    db.delete(project)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{project_id}/members", response_model=List[ProjectMemberSchema])
def get_project_members(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all members of a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has access to this project
    if not is_admin and project.created_by != current_user.id:
        # Check if user is a member of this project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this project",
            )
    
    # Get project members
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    
    return members


@router.post("/{project_id}/members", response_model=ProjectMemberSchema)
def add_project_member(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    member_in: ProjectMemberCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a member to a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has permission to add members to this project
    if not is_admin and project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to add members to this project",
        )
    
    # Check if the user exists
    user = db.query(User).filter(User.id == member_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if the user is already a member of this project
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_in.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project",
        )
    
    # Add the member
    member = ProjectMember(
        project_id=project_id,
        user_id=member_in.user_id,
        role=member_in.role,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
) -> Response:
    """
    Remove a member from a project.
    """
    is_admin = current_user.role and current_user.role.name == "admin"
    
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if user has permission to remove members from this project
    if not is_admin and project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to remove members from this project",
        )
    
    # Get the member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    
    # Remove the member
    db.delete(member)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)