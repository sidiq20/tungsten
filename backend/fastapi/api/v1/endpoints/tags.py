from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from api.dependencies import get_db, get_current_user
from models.tag import Tag
from schemas.tag import TagCreate, TagResponse

router = APIRouter()

@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_in: TagCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Tag).where(Tag.slug == tag_in.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tag slug already exists")
    
    tag = Tag(**tag_in.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag

@router.get("/", response_model=List[TagResponse])
async def read_tags(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Tag).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/search", response_model=List[TagResponse])
async def search_tags(q: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Tag).where(Tag.name.ilike(f"%{q}%")).limit(10)
    )
    return result.scalars().all()
