"""
Routes Package
Exports all FastAPI route modules.
"""
from src.routes.auth import router as auth_router
from src.routes.users import router as users_router

__all__ = ["auth_router", "users_router"]