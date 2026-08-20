from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth_middleware import require_manager, UserResponse
from app.services.call_service import call_service
from app.schemas.call import EmployeeItemResponse
from app.db.models import Employee

router = APIRouter(prefix="/employees", tags=["Employees"])


class UpdateEmployeePhoneRequest(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=32, description="E.164 phone number e.g. +17372508034")


@router.get(
    "",
    response_model=List[EmployeeItemResponse],
    summary="List all employees for manager selection",
)
def list_employees(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    """
    Returns list of employees in PostgreSQL for manager selection dropdown.
    Includes phone_number if configured.
    """
    employees = call_service.list_employees(db=db)
    return [
        EmployeeItemResponse(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            phone_number=emp.phone_number,
            role="employee",
            created_at=emp.created_at.isoformat() if emp.created_at else None,
        )
        for emp in employees
    ]


@router.patch(
    "/{employee_id}/phone",
    response_model=EmployeeItemResponse,
    summary="Update an employee's verified phone number for outbound call assessments",
)
def update_employee_phone(
    employee_id: str,
    payload: UpdateEmployeePhoneRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found.",
        )

    employee.phone_number = payload.phone_number.strip()
    db.commit()
    db.refresh(employee)

    return EmployeeItemResponse(
        id=employee.id,
        name=employee.name,
        email=employee.email,
        phone_number=employee.phone_number,
        role="employee",
        created_at=employee.created_at.isoformat() if employee.created_at else None,
    )
