"""
FareShare API - Main Application
FastAPI application entry point with health checks and database connectivity.
"""
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, status, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy import text, select

from src.config.db import init_db, close_db, get_async_session
from src.models import User, Ride, Booking, Review
from sqlalchemy import select

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignUpRequest(BaseModel):
    username: str
    password: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None  # 'passenger' or 'driver'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan events.
    - Startup: Initialize database connection pool
    - Shutdown: Close all database connections
    """
    # Startup
    logger.info("🚀 Starting FareShare API...")
    await init_db()
    logger.info("✅ Database connection pool initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down FareShare API...")
    await close_db()
    logger.info("✅ Database connections closed")


# Initialize FastAPI app
app = FastAPI(
    title="FareShare API",
    description="Ride-sharing platform with geospatial features",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - configure based on your frontend URL
app.add_middleware(
    CORSMiddleware,
    # During development, you can allow all origins for easier testing
    # allow_origins=["*"],  # WARNING: Only use this during development!
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",  # Vite default accessed via IP
        "http://localhost:3000",  # Create React App default
    ],  # In production, replace with specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to FareShare API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint with database connectivity test.
    Returns 200 if API and database are healthy, 503 otherwise.
    """
    try:
        # Test database connection with a simple query
        async with get_async_session() as session:
            result = await session.execute(text("SELECT 1 as health_check"))
            row = result.fetchone()
            
            if row and row[0] == 1:
                return {
                    "status": "healthy",
                    "database": "connected",
                    "message": "API and database are operational"
                }
            else:
                return {
                    "status": "unhealthy",
                    "database": "error",
                    "message": "Database query returned unexpected result"
                }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }




# API Endpoints
# These demonstrate the toJson functionality for model serialization

@app.get("/api/users", tags=["Users"])
async def get_users():
    """
    Get all users with JSON serialization.
    Demonstrates the toJson functionality.
    """
    try:
        async with get_async_session() as session:
            result = await session.execute(select(User).limit(5))
            users = result.scalars().all()
            
            # Use the toJson method to serialize users
            return {"users": [user.toJson() for user in users]}
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        return {
            "error": "Failed to get users",
            "details": str(e)
        }

@app.get("/api/rides", tags=["Rides"])
async def get_rides():
    """Get all rides with JSON serialization."""
    try:
        async with get_async_session() as session:
            result = await session.execute(select(Ride).limit(5))
            rides = result.scalars().all()
            
            # Use the toJson method to serialize rides
            return {"rides": [ride.toJson() for ride in rides]}
    except Exception as e:
        logger.error(f"Error getting rides: {e}")
        return {
            "error": "Failed to get rides",
            "details": str(e)
        }

@app.get("/api/bookings", tags=["Bookings"])
async def get_bookings():
    """Get all bookings with JSON serialization."""
    try:
        async with get_async_session() as session:
            result = await session.execute(select(Booking).limit(5))
            bookings = result.scalars().all()
            
            # Use the toJson method to serialize bookings
            return {"bookings": [booking.toJson() for booking in bookings]}
    except Exception as e:
        logger.error(f"Error getting bookings: {e}")
        return {
            "error": "Failed to get bookings",
            "details": str(e)
        }

@app.get("/api/reviews", tags=["Reviews"])
async def get_reviews():
    """Get all reviews with JSON serialization."""
    try:
        async with get_async_session() as session:
            result = await session.execute(select(Review).limit(5))
            reviews = result.scalars().all()
            
            # Use the toJson method to serialize reviews
            return {"reviews": [review.toJson() for review in reviews]}
    except Exception as e:
        logger.error(f"Error getting reviews: {e}")
        return {
            "error": "Failed to get reviews",
            "details": str(e)
        }

@app.get("/api/test", tags=["Test"])
async def test_api():
    """
    Test endpoint that returns a simple message.
    This can be used to verify API connectivity from frontend.
    """
    return {
        "message": "API connection successful",
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }



@app.post("/auth/signup", tags=["Auth"], status_code=status.HTTP_201_CREATED)
async def signup(payload: SignUpRequest):
    """
    Simple signup endpoint.
    - validates request
    - checks for duplicate email
    - hashes password and creates user record
    Note: For simplicity this does NOT require email verification — users are created active.
    """
    try:
        async with get_async_session() as session:
            # check duplicate email
            result = await session.execute(select(User).filter_by(email=payload.email))
            existing = result.scalar_one_or_none()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")

            # build full name
            full_name = ""
            if payload.first_name or payload.last_name:
                parts = []
                if payload.first_name:
                    parts.append(payload.first_name.strip())
                if payload.last_name:
                    parts.append(payload.last_name.strip())
                full_name = " ".join(parts)
            else:
                full_name = payload.username

            # hash password
            hashed = pwd_context.hash(payload.password)

            # Store role choice in verification_method (lightweight, schema change avoided)
            verification_method = payload.role if payload.role else None

            user = User(
                full_name=full_name,
                email=payload.email,
                password_hash=hashed,
                verification_method=verification_method,
            )

            session.add(user)
            # flush to persist (commit will happen in get_async_session context manager)
            await session.flush()

            return {"message": "User created"}
    except HTTPException:
        raise
    except Exception as e:
        # Log omitted here — return generic error
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Disable in production
    )
