from pydantic import BaseModel, EmailStr, Field, ConfigDict 
from typing import Optional, Dict, Any 
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50) 
    password: str = Field(..., min_length=8) 
    full_name: Optional[str] = None   

class TokenResponse(BaseModel):
    access_token: str 
    refresh_token: str 
    token_type: str = "bearer"
    expires_in: int     

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    privacy_settings: Optional[Dict[str, Any]] = None
    profile_metadata: Optional[Dict[str, Any]] = None
 
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    username: str 
    full_name: Optional[str] = None   
    reputation_score: int = 0
    role: str = "user"
    is_verified: bool = False
    privacy_settings: Optional[Dict[str, Any]] = None
    profile_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime 
