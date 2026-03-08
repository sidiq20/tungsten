from pydantic import BaseModel, EmailStr, Field 
from typing import Optional 
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50) # Fixed min_length
    password: str = Field(..., min_length=8)                # Fixed min_length
    full_name: Optional[str] = None                         # Fixed to full_name

class TokenResponse(BaseModel):
    access_token: str 
    refresh_token: str 
    token_type: str = "bearer"
    expires_in: int                                         # Fixed = to :

# schema for frontend 
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str 
    full_name: Optional[str]                                # Fixed to full_name
    reputation_score: int 
    role: str 
    is_verified: bool 
    created_at: datetime 

    class Config:                                           # Fixed 'config' to 'Config'
        from_attributes = True
