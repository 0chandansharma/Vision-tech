# app/schemas/role.py
from typing import Dict, Any
from pydantic import BaseModel
from datetime import datetime


class RoleBase(BaseModel):
    name: str
    permissions: Dict[str, bool]


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: str = None
    permissions: Dict[str, Any] = None


class Role(RoleBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True