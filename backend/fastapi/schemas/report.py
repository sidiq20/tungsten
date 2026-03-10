from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional
from models.report import ReportStatus

class ReportBase(BaseModel):
    target_type: str
    target_id: UUID4
    reason: str

class ReportCreate(ReportBase):
    pass

class ReportResolve(BaseModel):
    status: ReportStatus
    resolution_note: Optional[str] = None

class ReportResponse(ReportBase):
    id: UUID4
    reporter_id: UUID4
    status: ReportStatus
    resolved_by_id: Optional[UUID4] = None
    resolution_note: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
