from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.dependencies import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, TokenResponse
from core.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):

    # Check if a user with this email AND role already exists, OR if the username is taken
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
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):

    # find user my email oauth uses username field for the login identifier 
    # Try to find user by email first (but if multiple found, we'll need to be specific or use username)
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
    
    # If multiple users found (same email), find the one where the password matches
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

    return {
        "access_token": access_token,
        "refresh_token": "not_implemented_yet",
        "token_type": "bearer",
        "expires_in": 900 # 15 minutes
    }