from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from api.dependencies import get_db, get_current_user
from models.user import User
from models.post import Post
from models.course import Course
from schemas.user import UserResponse, UserUpdate
from schemas.post import PostResponse
from schemas.course import CourseResponse
from core.security import hash_password

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_in.email is not None:
        result = await db.execute(
            select(User).where(
                (User.email == user_in.email) & 
                (User.role == current_user.role) & 
                (User.id != current_user.id)
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Email already registered with this role"
            )
        current_user.email = user_in.email

    if user_in.username is not None:
        result = await db.execute(
            select(User).where(
                (User.username == user_in.username) & 
                (User.id != current_user.id)
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        current_user.username = user_in.username

    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name

    if user_in.password is not None:
        current_user.password_hash = hash_password(user_in.password)

    if user_in.privacy_settings is not None:
        # Merge or replace. Here we replace for simplicity.
        current_user.privacy_settings = user_in.privacy_settings

    if user_in.profile_metadata is not None:
        current_user.profile_metadata = user_in.profile_metadata

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me/bookmarks", response_model=List[PostResponse])
async def read_bookmarked_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.bookmarked_posts).selectinload(Post.tags))
        .options(selectinload(User.bookmarked_posts).selectinload(Post.course))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()
    return user.bookmarked_posts

@router.get("/me/subscriptions", response_model=List[CourseResponse])
async def read_subscribed_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.subscribed_courses))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()
    return user.subscribed_courses
