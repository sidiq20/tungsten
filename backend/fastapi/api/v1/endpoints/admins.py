from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from models.admin import Admin
from models.user import User
from models.post import Post
from models.audit_log import AuditLog
from schemas.admin import AdminCreate, AdminUpdate, AdminResponse, AdminRegistration
from schemas.user import UserResponse
from schemas.audit_log import AuditLogResponse
from api.dependencies import get_db, get_current_admin
from core.security import hash_password
from uuid import UUID
from datetime import datetime

from sqlalchemy import func
from schemas.admin import AdminCreate, AdminUpdate, AdminResponse, AdminRegistration, AdminStatsResponse
from schemas.report import ReportResponse, ReportResolve
from models.report import Report, ReportStatus

router = APIRouter()

@router.get("/stats", response_model=AdminStatsResponse)
async def read_admin_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    users_count = await db.execute(select(func.count()).select_from(User))
    posts_count = await db.execute(select(func.count()).select_from(Post))
    reports_count = await db.execute(select(func.count()).select_from(Report))
    logs_count = await db.execute(select(func.count()).select_from(AuditLog))
    
    return AdminStatsResponse(
        total_users=users_count.scalar() or 0,
        total_posts=posts_count.scalar() or 0,
        total_reports=reports_count.scalar() or 0,
        total_audit_logs=logs_count.scalar() or 0,
        system_status="healthy"
    )

@router.get("/users", response_model=List[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/users/{user_id}/ban", status_code=status.HTTP_200_OK)
async def ban_user(
    user_id: UUID,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_banned = True
    
    audit_log = AuditLog(
        user_id=current_admin.user_id,
        action="user_ban",
        description=f"Banned user {user_id}",
        metadata_json={"target_user_id": str(user_id)}
    )
    db.add(audit_log)
    
    await db.commit()
    return {"message": f"User {user_id} has been banned"}

@router.post("/users/{user_id}/unban", status_code=status.HTTP_200_OK)
async def unban_user(
    user_id: UUID,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_banned = False
    
    audit_log = AuditLog(
        user_id=current_admin.user_id,
        action="user_unban",
        description=f"Unbanned user {user_id}",
        metadata_json={"target_user_id": str(user_id)}
    )
    db.add(audit_log)
    
    await db.commit()
    return {"message": f"User {user_id} has been unbanned"}

@router.patch("/users/{user_id}/reputation", response_model=UserResponse)
async def adjust_reputation(
    user_id: UUID,
    amount: int,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.reputation_score += amount
    
    audit_log = AuditLog(
        user_id=current_admin.user_id,
        action="reputation_adjustment",
        description=f"Adjusted reputation for user {user_id} by {amount}",
        metadata_json={"target_user_id": str(user_id), "amount": amount}
    )
    db.add(audit_log)
    
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/reports", response_model=List[ReportResponse])
async def read_reports(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Report).offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/reports/{report_id}", response_model=ReportResponse)
async def resolve_report(
    report_id: UUID,
    report_resolve: ReportResolve,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = report_resolve.status
    report.resolution_note = report_resolve.resolution_note
    report.resolved_by_id = current_admin.user_id
    report.resolved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(report)
    return report

@router.delete("/content/{target_type}/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    target_type: str,
    target_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if target_type == "post":
        content = await db.get(Post, target_id)
    else:
        raise HTTPException(status_code=400, detail="Unsupported target type")
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    await db.delete(content)
    
    audit_log = AuditLog(
        user_id=current_admin.user_id,
        action="content_deletion",
        description=f"Deleted {target_type} {target_id}",
        metadata_json={"target_type": target_type, "target_id": str(target_id)}
    )
    db.add(audit_log)
    
    await db.commit()
    return None

@router.post("/", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(admin_in: AdminCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admin).where(Admin.user_id == admin_in.user_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Admin already exists for this user")
    
    admin = Admin(**admin_in.model_dump())
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin

@router.post("/register-admin", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(admin_data: AdminRegistration, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            ((User.email == admin_data.email) & (User.role == "admin")) |
            (User.username == admin_data.username)
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        if existing_user.username == admin_data.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        raise HTTPException(status_code=400, detail="An admin with this email already exists")
    
    new_user = User(
        email=admin_data.email,
        username=admin_data.username,
        password_hash=hash_password(admin_data.password),
        full_name=admin_data.full_name,
        role="admin"  
    )
    db.add(new_user)
    await db.flush() 
    
    admin = Admin(
        user_id=new_user.id,
        permissions_level=admin_data.permissions_level
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin

@router.get("/", response_model=List[AdminResponse])
async def read_admins(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admin).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.get("/{admin_id}", response_model=AdminResponse)
async def read_admin(admin_id: str, db: AsyncSession = Depends(get_db)):
    admin = await db.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(admin_id: str, admin_in: AdminUpdate, db: AsyncSession = Depends(get_db)):
    admin = await db.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    update_data = admin_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    await db.commit()
    await db.refresh(admin)
    return admin

@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(admin_id: str, db: AsyncSession = Depends(get_db)):
    admin = await db.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.delete(admin)
    await db.commit()
    return None
