from pydantic import BaseModel, UUID4
from typing import Optional
from uuid import UUID
from datetime import datetime

class VoteToggle(BaseModel):
    target_type: str  
    target_id: UUID4
    value: int  

class VoteResponse(BaseModel):
    target_id: UUID4
    upvotes: int
    downvotes: int
    user_vote: Optional[int] = None

    class Config:
        from_attributes = True
