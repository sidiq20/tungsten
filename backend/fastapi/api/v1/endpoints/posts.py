from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import List, Optional, Any
from uuid import UUID

from api.dependencies import get_db, get_current_user, get_redis
from redis.asyncio import Redis
import json
from models.post import Post, PostStatus
from models.user import User
from schemas.post import PostCreate, PostResponse, PostUpdate
from core.reputation import update_reputation

from models.tag import Tag
from models.course import Course
from models.vote import Vote
from schemas.vote import VoteResponse

router = APIRouter()

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    if post_in.file_url:
        import os
        ext = os.path.splitext(post_in.file_url)[1].lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
             raise HTTPException(status_code=400, detail="Only PDF and Image files are allowed")
        
        if post_in.file_type and post_in.file_type not in ["application/pdf", "image/jpeg", "image/png"]:
             raise HTTPException(status_code=400, detail="Invalid file MIME type")

    new_post = Post(
        author_id=current_user.id,
        course_id=post_in.course_id,
        title=post_in.title,
        content=post_in.content,
        file_url=post_in.file_url,
        file_type=post_in.file_type,
        status=post_in.status,
        is_anonymous=post_in.is_anonymous
    )
    
    if post_in.tags:
        for tag_name in post_in.tags:
            tag_slug = tag_name.lower().replace(" ", "-")
            result = await db.execute(select(Tag).where(Tag.slug == tag_slug))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(name=tag_name, slug=tag_slug)
                db.add(tag)
                await db.flush()
            new_post.tags.append(tag)

    db.add(new_post)
    
    if post_in.status == PostStatus.PUBLISHED:
        await update_reputation(
            db, 
            current_user, 
            amount=10, 
            action_type="post_created", 
            description=f"Earned 10 reputation for publishing: {post_in.title}"
        )
    
    await db.commit()
    
    # Trigger background jobs using Redis
    try:
        await redis.publish('note_created', json.dumps({
            'note_id': str(new_post.id),
            'uploader_id': str(current_user.id),
            'status': post_in.status
        }))
    except Exception as e:
        print(f"Failed to publish to redis: {e}")
    
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Post)
        .options(joinedload(Post.tags), joinedload(Post.course))
        .where(Post.id == new_post.id)
    )
    new_post = result.unique().scalar_one()
    return new_post

from sqlalchemy import func, or_
from schemas.post import PaginatedPostResponse

@router.get("/", response_model=PaginatedPostResponse)
async def read_posts(
    page: int = 1,
    limit: int = 20,
    course_id: Optional[UUID] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "recent", 
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * limit
    query = select(Post).where(Post.status == PostStatus.PUBLISHED)
    
    if course_id:
        query = query.where(Post.course_id == course_id)
    
    if tag:
        query = query.join(Post.tags).where(Tag.slug == tag)
        
    if search:
        query = query.where(
            or_(
                Post.title.ilike(f"%{search}%"),
                Post.content.ilike(f"%{search}%")
            )
        )
        
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    if sort_by == "popular":
        query = query.order_by(Post.upvotes.desc(), Post.created_at.desc())
    else: 
        query = query.order_by(Post.created_at.desc())
        
    query = query.options(joinedload(Post.tags), joinedload(Post.course))
        
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.unique().scalars().all()
    
    return PaginatedPostResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )

@router.get("/{post_id}", response_model=PostResponse)
async def read_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Post)
        .options(joinedload(Post.tags), joinedload(Post.course))
        .where(Post.id == post_id)
    )
    post = result.unique().scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
      
    post.view_count += 1
    db.add(post)
    await db.commit()
    
 
    result = await db.execute(
        select(Post)
        .options(joinedload(Post.tags), joinedload(Post.course))
        .where(Post.id == post_id)
    )
    post = result.unique().scalar_one()
    
    return post

@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: UUID,
    post_in: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
        
    if post_in.title is not None:
        post.title = post_in.title
    if post_in.content is not None:
        post.content = post_in.content
    if post_in.status is not None:
        post.status = post_in.status
        
    db.add(post)
    await db.commit()
    
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Post)
        .options(joinedload(Post.tags), joinedload(Post.course))
        .where(Post.id == post_id)
    )
    post = result.unique().scalar_one()
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await db.delete(post)
    await db.commit()
    return None

@router.post("/{post_id}/bookmark", status_code=status.HTTP_204_NO_CONTENT)
async def bookmark_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    from sqlalchemy import insert
    from models.bookmark import user_bookmarks
    
    try:
        await db.execute(
            insert(user_bookmarks).values(user_id=current_user.id, post_id=post_id)
        )
        await db.commit()
    except Exception:
        await db.rollback()
        pass
    
    return None

@router.delete("/{post_id}/bookmark", status_code=status.HTTP_204_NO_CONTENT)
async def unbookmark_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import delete
    from models.bookmark import user_bookmarks
    
    await db.execute(
        delete(user_bookmarks).where(
            (user_bookmarks.c.user_id == current_user.id) & 
            (user_bookmarks.c.post_id == post_id)
        )
    )
    await db.commit()
    return None
