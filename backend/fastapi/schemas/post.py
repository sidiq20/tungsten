from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

from schemas.tag import TagResponse
from schemas.course import CourseResponse
from typing import List

class PostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10)
    status: PostStatus = PostStatus.PUBLISHED
    is_anonymous: bool = False

class PostCreate(PostBase):
    course_id: Optional[UUID] = None
    tags: List[str] = []
    file_url: Optional[str] = None
    file_type: Optional[str] = None

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    status: Optional[PostStatus] = None
    course_id: Optional[UUID] = None
    is_anonymous: Optional[bool] = None

class PostResponse(PostBase):
    id: UUID
    author_id: UUID
    course_id: Optional[UUID]
    file_url: Optional[str]
    file_type: Optional[str]
    view_count: int
    upvotes: int
    created_at: datetime
    updated_at: datetime
    
    course: Optional[CourseResponse] = None
    tags: List[TagResponse] = []
    
    is_bookmarked: bool = False
    user_vote: Optional[int] = None

    class Config:
        from_attributes = True

class PaginatedPostResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[PostResponse]
