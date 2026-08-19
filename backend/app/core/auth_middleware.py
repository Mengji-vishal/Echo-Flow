from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token
from app.services.user_store import user_store
from app.schemas.auth import UserResponse

security = HTTPBearer(auto_error=True)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """
    Validate Bearer token and retrieve the user record strictly from the designated PostgreSQL table:
    - 'managers' table if token claims role === 'manager'
    - 'employees' table if token claims role === 'employee'
    - Does NOT fallback across tables.
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id: Optional[str] = payload.get("userId") or payload.get("user_id")
    email: Optional[str] = payload.get("email")
    claimed_role: Optional[str] = payload.get("role")

    if not user_id or not claimed_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token: missing user identifier or role claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if claimed_role not in ("manager", "employee"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token: unrecognized role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Lookup user strictly from the specific PostgreSQL table corresponding to their claimed role
    user_record = user_store.get_by_id_and_role(user_id, claimed_role)

    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User account does not exist or has been removed from the {claimed_role}s database table",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        role=user_record["role"],
        created_at=user_record.get("created_at"),
    )


def require_role(required_role: str) -> Callable:
    """Dependency factory that verifies if the authenticated user belongs to the required role table."""
    def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires '{required_role}' permissions. Current user role is '{current_user.role}'.",
            )
        return current_user
    return role_checker


# Role-specific dependency shortcuts
require_manager = require_role("manager")
require_employee = require_role("employee")
require_auth = get_current_user
