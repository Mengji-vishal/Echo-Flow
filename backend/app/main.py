from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.calls import router as calls_router
from app.api.employees import router as employees_router
from app.api.employee_portal import router as employee_portal_router
from app.api.manager_analytics import router as manager_analytics_router
from app.api.twilio_voice import router as twilio_voice_router
from app.core.auth_middleware import require_manager, require_employee, UserResponse
from app.db.session import init_db, SessionLocal
from app.services.user_service import user_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial demo accounts
    try:
        init_db()
        with SessionLocal() as db:
            user_service.seed_demo_accounts(db)
    except Exception as e:
        print(f"Database initialization warning: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Echo-Flow AI Assessment & Training Platform API",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(calls_router)
app.include_router(employees_router)
app.include_router(employee_portal_router)
app.include_router(manager_analytics_router)
app.include_router(twilio_voice_router)


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "database": "postgresql (separate managers & employees tables)",
        "database_name": settings.POSTGRES_DB,
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Role-protected test routes for automated verification
@app.get("/auth/manager-only", tags=["Authentication"])
async def manager_only_test(current_user: UserResponse = Depends(require_manager)):
    return {
        "message": "Welcome Manager! Access authorized.",
        "user": current_user,
    }


@app.get("/auth/employee-only", tags=["Authentication"])
async def employee_only_test(current_user: UserResponse = Depends(require_employee)):
    return {
        "message": "Welcome Employee! Access authorized.",
        "user": current_user,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
