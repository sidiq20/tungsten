from sqlalchemy.ext.asyncio import AsyncSession
from models.audit_log import AuditLog
from typing import Optional, Dict, Any
from uuid import UUID

async def log_action(
    db: AsyncSession,
    user_id: UUID,
    action: str,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Helper function to create and persist an AuditLog entry.
    """
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        description=description,
        metadata_json=metadata
    )
    db.add(audit_log)
    return audit_log
