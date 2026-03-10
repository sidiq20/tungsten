from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from api.dependencies import get_db, get_current_user
from models.user import User
from models.report import Report
from schemas.report import ReportCreate, ReportResponse

router = APIRouter()

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a new report on content (Post, User, etc.).
    """
    new_report = Report(
        reporter_id=current_user.id,
        target_type=report_in.target_type,
        target_id=report_in.target_id,
        reason=report_in.reason
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report
