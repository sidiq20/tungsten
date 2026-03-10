from sqlalchemy import Column, ForeignKey, DateTime, Table
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import Base

user_bookmarks = Table(
    "user_bookmarks",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime, default=datetime.utcnow)
)
