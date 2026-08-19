from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    MeResponse,
    UserResponse,
)
from app.services.user_store import user_store
from app.core.security import create_access_token
from app.core.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Manager or Employee",
)
async def register(register_data: RegisterRequest):
    """
    Register a new user into the corresponding PostgreSQL table:
    - If role is 'manager' -> inserted strictly into 'managers' table
    - If role is 'employee' -> inserted strictly into 'employees' table
    - Checks email uniqueness across BOTH tables before insertion (returns 409 if exists)
    """
    # Check if email is already taken in either table
    if user_store.email_exists(register_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    try:
        new_user = user_store.create_user(
            name=register_data.name,
            email=register_data.email,
            plain_password=register_data.password,
            role=register_data.role,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Generate JWT token with role obtained from PostgreSQL
    token = create_access_token(
        user_id=new_user["id"],
        email=new_user["email"],
        role=new_user["role"],
    )

    user_response = UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        created_at=new_user.get("created_at"),
    )

    return AuthResponse(
        token=token,
        user=user_response,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate user against the requested portal role table",
)
async def login(login_data: LoginRequest):
    """
    Role-specific Login:
    - If role is 'manager': queries ONLY 'managers' table. Never checks employees.
    - If role is 'employee': queries ONLY 'employees' table. Never checks managers.
    - If credentials do not match in that specific table, returns HTTP 401.
    - Issues JWT containing role from the authenticated table.
    """
    target_role = login_data.role.strip().lower()

    if target_role == "manager":
        authenticated_user = user_store.authenticate_manager(
            email=login_data.email,
            plain_password=login_data.password,
        )
    elif target_role == "employee":
        authenticated_user = user_store.authenticate_employee(
            email=login_data.email,
            plain_password=login_data.password,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid login role '{login_data.role}'. Must be 'manager' or 'employee'.",
        )

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token with role from the authenticated table
    token = create_access_token(
        user_id=authenticated_user["id"],
        email=authenticated_user["email"],
        role=authenticated_user["role"],
    )

    user_response = UserResponse(
        id=authenticated_user["id"],
        name=authenticated_user["name"],
        email=authenticated_user["email"],
        role=authenticated_user["role"],
        created_at=authenticated_user.get("created_at"),
    )

    return AuthResponse(
        token=token,
        user=user_response,
    )


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get currently authenticated identity from PostgreSQL",
)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """
    Verify the active JWT token and return the authenticated user record from the role-specific PostgreSQL table.
    """
    return MeResponse(user=current_user)
