from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Dict, Any

from api.dependencies import get_db
from models.post import Post, PostStatus
from models.course import Course
from schemas.post import PostResponse
from schemas.search import SearchResponse
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("/", response_model=SearchResponse)
async def global_search(
    q: str,
    db: AsyncSession = Depends(get_db)
):
    posts_query = (
        select(Post)
        .options(joinedload(Post.tags), joinedload(Post.course))
        .where(
            Post.status == PostStatus.PUBLISHED,
            or_(
                Post.title.ilike(f"%{q}%"),
                Post.content.ilike(f"%{q}%")
            )
        )
        .limit(10)
    )
    posts_result = await db.execute(posts_query)
    posts = posts_result.unique().scalars().all()


    courses_query = select(Course).where(
        or_(
            Course.code.ilike(f"%{q}%"),
            Course.name.ilike(f"%{q}%")
        )
    ).limit(5)
    courses_result = await db.execute(courses_query)
    courses = courses_result.scalars().all()

    return {
        "posts": posts,
        "courses": courses,
        "query": q
    }
