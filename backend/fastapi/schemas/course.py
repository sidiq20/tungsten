from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List

class CourseBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    department: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None

class CourseResponse(CourseBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedCourseResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[CourseResponse]
