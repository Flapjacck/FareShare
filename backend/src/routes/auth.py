"""
Authentication Routes
Handles user registration, login, and logout endpoints.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from email_validator import validate_email, EmailNotValidError

from src.config.db import get_db
from src.models.user import User
from src.schemas.user import UserRegister, UserLogin, Token, UserResponse
from src.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    validate_password_strength,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    
    Creates a new user with hashed password and returns basic user info.
    Email must be unique across all users.
    """
    # Validate email format
    try:
        # Use check_deliverability=False for development to allow example.com
        validate_email(user_data.email, check_deliverability=False)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet security requirements"
        )
    
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address is already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email.lower(),  # Store emails in lowercase
        password_hash=hashed_password,
        role="user",  # Default role
        verification_status="pending",  # TODO: Implement email verification
        status="active"
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Return user info (password hash excluded automatically by schema)
    return new_user


@router.post("/login", response_model=Token)
async def login_user(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login user and return access token.
    
    Validates email/password and returns JWT token for authenticated requests.
    """
    # TODO: Implement rate limiting for login attempts
    
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == login_data.email.lower())
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists and password is correct
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is active
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    }


@router.post("/logout")
async def logout_user():
    """
    Logout user (optional endpoint).
    
    Since we're using stateless JWT tokens, logout is handled client-side
    by removing the token. This endpoint exists for completeness and
    future enhancements (like token blacklisting).
    
    TODO: Implement token blacklisting with Redis for enhanced security
    """
    return {
        "message": "Logout successful",
        "detail": "Remove token from client storage"
    }