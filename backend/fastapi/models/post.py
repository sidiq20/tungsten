from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from .base import Base
from .bookmark import user_bookmarks

class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    view_count = Column(Integer, default=0)
    upvotes = Column(Integer, default=0)
    is_anonymous = Column(Boolean, default=False)
    status = Column(String(50), default=PostStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", backref="posts")
    course = relationship("Course", backref="posts")
    tags = relationship("Tag", secondary="note_tags", backref="posts")
    bookmarked_by = relationship("User", secondary=user_bookmarks, back_populates="bookmarked_posts")
