from pydantic import BaseModel, UUID4, EmailStr, Field
from datetime import datetime
from typing import Optional

class AdminBase(BaseModel):
    user_id: UUID4
    permissions_level: int = 1
    is_active: bool = True

class AdminCreate(AdminBase):
    pass

class AdminRegistration(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    permissions_level: int = 1

class AdminUpdate(BaseModel):
    permissions_level: Optional[int] = None
    is_active: Optional[bool] = None

class AdminResponse(AdminBase):
    id: UUID4
    last_active: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    total_posts: int
    total_reports: int
    total_audit_logs: int
    system_status: str = "healthy"
