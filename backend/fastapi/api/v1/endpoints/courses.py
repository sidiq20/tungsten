from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from api.dependencies import get_db, get_current_admin, get_current_user, get_course_moderator
from models.subscription import course_subscriptions
from models.course import Course
from models.user import User
from schemas.course import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter()

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    moderator = Depends(get_course_moderator),
    db: AsyncSession = Depends(get_db)
):
    """Create a new course (Admin only)."""
    result = await db.execute(select(Course).where(Course.code == course_in.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course = Course(**course_in.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course

from sqlalchemy import func, or_
from schemas.course import PaginatedCourseResponse

@router.get("/", response_model=PaginatedCourseResponse)
async def read_courses(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all courses with search and pagination."""
    skip = (page - 1) * limit
    query = select(Course)
    
    if search:
        query = query.where(
            or_(
                Course.code.ilike(f"%{search}%"),
                Course.name.ilike(f"%{search}%"),
                Course.department.ilike(f"%{search}%")
            )
        )
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    result = await db.execute(query.order_by(Course.code).offset(skip).limit(limit))
    items = result.scalars().all()
    
    return PaginatedCourseResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    moderator = Depends(get_course_moderator),
    db: AsyncSession = Depends(get_db)
):
    """Delete a course (Admin only)."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await db.delete(course)
    await db.commit()
    return None

@router.get("/{course_id}", response_model=CourseResponse)
async def read_course(course_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get course by ID."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_in: CourseUpdate,
    moderator = Depends(get_course_moderator),
    db: AsyncSession = Depends(get_db)
):
    """Update a course (Admin only)."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    return course

@router.post("/{course_id}/subscribe", status_code=status.HTTP_204_NO_CONTENT)
async def subscribe_to_course(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Check if already subscribed
    from sqlalchemy import insert, delete
    from models.subscription import course_subscriptions
    
    # We use a direct insert to avoid loading relationships if not needed
    try:
        await db.execute(
            insert(course_subscriptions).values(user_id=current_user.id, course_id=course_id)
        )
        await db.commit()
    except Exception:
        # Prob already exists
        await db.rollback()
        pass
    
    return None

@router.delete("/{course_id}/subscribe", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe_from_course(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unsubscribe from a course."""
    from sqlalchemy import delete
    from models.subscription import course_subscriptions
    
    await db.execute(
        delete(course_subscriptions).where(
            (course_subscriptions.c.user_id == current_user.id) & 
            (course_subscriptions.c.course_id == course_id)
        )
    )
    await db.commit()
    return None
