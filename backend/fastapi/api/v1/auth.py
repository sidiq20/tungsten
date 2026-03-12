from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.dependencies import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, TokenResponse
from core.security import hash_password, verify_password, create_access_token
from core.limiter import limiter
from core.audit import log_action
from core.config import settings

router = APIRouter()

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI

GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://googleapis.com/oauth2/v2/userinfo"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):

    existing_user_query = await db.execute(
        select(User).where(
            ((User.email == user_data.email) & (User.role == "user")) |
            (User.username == user_data.username)
        )
    )
    existing_user = existing_user_query.scalar_one_or_none()

    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name
    )

    db.add(new_user)
    await db.flush()

    await log_action(
        db=db,
        user_id=new_user.id,
        action="user_registration",
        description=f"User registered with email {new_user.email}"
    )

    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):

    user_query = await db.execute(
        select(User).where(
            (User.email == form_data.username) | (User.username == form_data.username)
        )
    )
    users = user_query.scalars().all()

    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect email or pass",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = None
    for u in users:
        if verify_password(form_data.password, u.password_hash):
            user = u
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect email or pass",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user.id))

    await log_action(
        db=db,
        user_id=user.id,
        action="user_login",
        description="User logged in"
    )
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": "not_implemented_yet",
        "token_type": "bearer",
        "expires_in": 900 
    }