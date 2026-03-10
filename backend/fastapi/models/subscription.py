from sqlalchemy import Column, ForeignKey, DateTime, Table
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import Base

course_subscriptions = Table(
    "course_subscriptions",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("course_id", UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime, default=datetime.utcnow)
)
