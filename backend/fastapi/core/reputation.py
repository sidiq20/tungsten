from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.audit_log import AuditLog
import json

REPUTATION_WEIGHTS = {
    "post_created": 10,
    "post_upvoted": 5,
    "post_downvoted": -2,
    "comment_upvoted": 2,
    "bookmark_received": 1,
    "report_resolved_valid": -50, # Penalty for valid report
}

async def update_reputation(
    db: AsyncSession, 
    user: User, 
    amount: int, 
    action_type: str, 
    description: str = None,
    metadata: dict = None
):
    old_score = user.reputation_score
    user.reputation_score += amount
    
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
    
    return user.reputation_score
