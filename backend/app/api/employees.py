from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth_middleware import require_manager, UserResponse
from app.services.call_service import call_service
from app.schemas.call import EmployeeItemResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


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
    Omits password hashes and internal credentials.
    """
    employees = call_service.list_employees(db=db)
    return [
        EmployeeItemResponse(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role="employee",
            created_at=emp.created_at.isoformat() if emp.created_at else None,
        )
        for emp in employees
    ]
