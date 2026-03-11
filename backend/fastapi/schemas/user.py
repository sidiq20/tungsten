from pydantic import BaseModel, EmailStr, Field 
from typing import Optional 
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
 
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str 
    full_name: Optional[str]   
    reputation_score: int 
    role: str 
    is_verified: bool 
    created_at: datetime 

    class Config:      
        from_attributes = True
