from pydantic import BaseModel, UUID4
from typing import Optional

class TagBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: UUID4

    class Config:
        from_attributes = True
