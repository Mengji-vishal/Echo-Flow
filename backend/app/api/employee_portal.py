from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth_middleware import require_employee, UserResponse
from app.db.models import Call
from app.services.training_service import training_service
from app.schemas.training import (
    TrainingModuleResponse,
    UpdateTrainingProgressRequest,
    EmployeePerformanceSummaryResponse,
    QuizClientResponse,
    SubmitQuizRequest,
    QuizResultResponse,
)
from app.schemas.call import CallSummaryResponse

router = APIRouter(prefix="/employee", tags=["Employee Portal"])


@router.get(
    "/performance",
    response_model=EmployeePerformanceSummaryResponse,
    summary="Get aggregated performance scorecard and QA metrics for the authenticated employee",
)
def get_employee_performance(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    try:
        summary = training_service.get_employee_performance_summary(
            db=db,
            employee_id=current_user.id,
        )
        return summary
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/training",
    response_model=List[TrainingModuleResponse],
    summary="Get personalized recommended training modules for the authenticated employee",
)
def get_employee_training_modules(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    modules = training_service.get_employee_training_modules(
        db=db,
        employee_id=current_user.id,
    )
    return [m.to_dict() for m in modules]


@router.post(
    "/training/{module_id}/complete-learning",
    response_model=TrainingModuleResponse,
    summary="Mark lesson material as studied and prepare module for comprehension quiz",
)
def complete_learning_material(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    try:
        updated = training_service.complete_module_learning(
            db=db,
            module_id=module_id,
            employee_id=current_user.id,
        )
        return updated.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/training/{module_id}/quiz",
    response_model=QuizClientResponse,
    summary="Get comprehension quiz for a training module (correct answers kept secure)",
)
def get_module_quiz(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    try:
        quiz_data = training_service.get_or_create_module_quiz(
            db=db,
            module_id=module_id,
            employee_id=current_user.id,
        )
        return quiz_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/training/{module_id}/quiz/submit",
    response_model=QuizResultResponse,
    summary="Submit quiz answers, evaluate score, and update module completion status",
)
def submit_module_quiz(
    module_id: str,
    request: SubmitQuizRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    try:
        result = training_service.submit_quiz_attempt(
            db=db,
            module_id=module_id,
            employee_id=current_user.id,
            submitted_answers=request.answers,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/training/{module_id}/progress",
    response_model=TrainingModuleResponse,
    summary="Update learning progress and completion status on a training module",
)
def update_module_progress(
    module_id: str,
    request: UpdateTrainingProgressRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    try:
        updated = training_service.update_module_progress(
            db=db,
            module_id=module_id,
            employee_id=current_user.id,
            progress=request.progress,
            status=request.status,
        )
        return updated.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/calls",
    response_model=List[CallSummaryResponse],
    summary="Get all assessment calls conducted for the authenticated employee",
)
def get_employee_calls(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_employee),
):
    calls = (
        db.query(Call)
        .filter(Call.employee_id == current_user.id)
        .order_by(Call.created_at.desc())
        .all()
    )
    result = []
    for c in calls:
        data = c.to_dict(include_details=False)
        data["overall_score"] = c.analysis.overall_score if c.analysis else None
        result.append(data)
    return result
