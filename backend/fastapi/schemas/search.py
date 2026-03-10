from pydantic import BaseModel
from typing import List
from schemas.post import PostResponse
from schemas.course import CourseResponse

class SearchResponse(BaseModel):
    posts: List[PostResponse]
    courses: List[CourseResponse]
    query: str

    class Config:
        from_attributes = True
