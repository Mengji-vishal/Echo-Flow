from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name")
    email: str = Field(..., min_length=5, max_length=150, description="User Email")
    password: str = Field(..., min_length=6, max_length=100, description="Plain Text Password")
    role: str = Field(..., description="Role: 'manager' or 'employee'")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        clean_role = v.strip().lower()
        if clean_role not in ("manager", "employee"):
            raise ValueError("Role must be either 'manager' or 'employee'")
        return clean_role

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_email = v.strip().lower()
        if "@" not in clean_email or "." not in clean_email:
            raise ValueError("Invalid email format")
        return clean_email


class LoginRequest(BaseModel):
    email: str = Field(..., description="User Email")
    password: str = Field(..., description="Plain Text Password")
    role: str = Field(..., description="Target Portal Role: 'manager' or 'employee'")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        clean_role = v.strip().lower()
        if clean_role not in ("manager", "employee"):
            raise ValueError("Role must be either 'manager' or 'employee'")
        return clean_role

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_email = v.strip().lower()
        if "@" not in clean_email or "." not in clean_email:
            raise ValueError("Invalid email format")
        return clean_email


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class MeResponse(BaseModel):
    user: UserResponse
