from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.audit_log import AuditLog
import json

async def update_reputation(
    db: AsyncSession, 
    user: User, 
    amount: int, 
    action_type: str, 
    description: str = None,
    metadata: dict = None
):
    """
    Update user reputation and log the action.
    """
    old_score = user.reputation_score
    user.reputation_score += amount
    
    # Create audit log
    log = AuditLog(
        user_id=user.id,
        action=action_type,
        description=description or f"Reputation changed by {amount}",
        metadata_json={
            "delta": amount,
            "old_score": old_score,
            "new_score": user.reputation_score,
            **(metadata or {})
        }
    )
    
    db.add(log)
    db.add(user)
    # Note: caller should commit the session
    return user.reputation_score
