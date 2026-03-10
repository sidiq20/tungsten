from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from models.base import Base
from .bookmark import user_bookmarks
from .subscription import course_subscriptions

class User(Base):
    __tablename__ = "users"

    id =   Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    reputation_score = Column(Integer, default=0, index=True)
    role = Column(String(20), default="user")
    is_verified = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('email', 'role', name='_email_role_uc'),
    )

    # Relationships
    bookmarked_posts = relationship("Post", secondary=user_bookmarks, back_populates="bookmarked_by")
    subscribed_courses = relationship("Course", secondary=course_subscriptions, back_populates="subscribers")
