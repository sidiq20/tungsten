from pydantic import BaseModel
from typing import Optional, Any
from uuid import UUID
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    description: Optional[str]
    metadata_json: Optional[Any]
    timestamp: datetime

    class Config:
        from_attributes = True
