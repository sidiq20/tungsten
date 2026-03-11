from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from core.s3 import s3_storage
from api.dependencies import get_current_user, get_redis
from redis.asyncio import Redis
import json

router = APIRouter()

class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str
    expires_in: Optional[int] = 300

class PresignedUrlResponse(BaseModel):
    upload_url: str
    file_key: str
    public_url: str
    expires_in: int

@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def get_presigned_url(
    request: PresignedUrlRequest,
    current_user = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    import uuid
    import os
    file_ext = os.path.splitext(request.filename)[1]
    file_key = f"uploads/{current_user.id}/{uuid.uuid4()}{file_ext}"
    
    try:
        upload_url = await s3_storage.generate_presigned_url(
            file_key=file_key,
            content_type=request.content_type,
            expires_in=request.expires_in
        )
        public_url = await s3_storage.get_public_url(file_key)
        
        # Store pending upload in Redis
        await redis.setex(
            f"pending_upload:{file_key}",
            request.expires_in or 300,
            json.dumps({
                'user_id': str(current_user.id),
                'content_type': request.content_type
            })
        )
        
        return PresignedUrlResponse(
            upload_url=upload_url,
            file_key=file_key,
            public_url=public_url,
            expires_in=request.expires_in
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate presigned URL: {str(e)}"
        )
