from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth_middleware import require_manager, UserResponse
from app.services.call_service import call_service
from app.services.analysis_service import analysis_service
from app.services.training_service import training_service
from app.schemas.call import (
    CreateCallRequest,
    CallDetailResponse,
    CallSummaryResponse,
    CreateTranscriptRequest,
    CallTranscriptResponse,
    CreateAnalysisRequest,
    CallAnalysisResponse,
)

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post(
    "",
    response_model=CallDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assessment call with exactly 5 questions",
)
def create_call(
    request: CreateCallRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    try:
        new_call = call_service.create_call(
            db=db,
            manager_id=current_user.id,
            employee_id=request.employee_id,
            questions=request.questions,
        )
        return new_call.to_dict(include_details=True)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=List[CallSummaryResponse],
    summary="List all assessment calls created by the authenticated manager",
)
def list_manager_calls(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    calls = call_service.get_manager_calls(db=db, manager_id=current_user.id)
    result = []
    for c in calls:
        data = c.to_dict(include_details=False)
        data["overall_score"] = c.analysis.overall_score if c.analysis else None
        result.append(data)
    return result


@router.get(
    "/{call_id}",
    response_model=CallDetailResponse,
    summary="Get complete assessment call details (5 questions, transcript, analysis, training modules)",
)
def get_call_details(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    call = call_service.get_call_by_id(db=db, call_id=call_id, manager_id=current_user.id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call '{call_id}' not found or access denied.",
        )
    data = call.to_dict(include_details=True)
    data["recommended_training"] = [
        tm.to_dict() for tm in (call.training_modules or [])
    ]
    return data


@router.get(
    "/{call_id}/transcript",
    response_model=List[CallTranscriptResponse],
    summary="Get all transcript entries for a call",
)
def get_call_transcripts(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    call = call_service.get_call_by_id(db=db, call_id=call_id, manager_id=current_user.id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Call '{call_id}' not found.")
    return [t.to_dict() for t in call.transcripts]


@router.post(
    "/{call_id}/transcript",
    response_model=CallTranscriptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a transcript dialogue entry to a call (Testing & Telephony Ingestion)",
)
def add_call_transcript(
    call_id: str,
    request: CreateTranscriptRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    try:
        entry = call_service.add_transcript_entry(
            db=db,
            call_id=call_id,
            manager_id=current_user.id,
            speaker=request.speaker,
            text=request.text,
            timestamp=request.timestamp,
        )
        return entry.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/{call_id}/analysis",
    response_model=CallAnalysisResponse,
    summary="Get the QA evaluation and performance analysis for a call",
)
def get_call_analysis(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    call = call_service.get_call_by_id(db=db, call_id=call_id, manager_id=current_user.id)
    if not call or not call.analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis not found for call '{call_id}'.",
        )
    return call.analysis.to_dict()


@router.post(
    "/{call_id}/analysis",
    response_model=CallAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save conversational evaluation analysis for a call (Testing & Ingestion Infrastructure)",
)
def save_call_analysis(
    call_id: str,
    request: CreateAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    try:
        analysis = analysis_service.analyze_call(
            db=db,
            call_id=call_id,
            custom_analysis=request.model_dump(),
        )
        # Generate associated training modules for identified weak areas
        training_service.generate_modules_for_call(db, call_id, analysis)
        return analysis.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/{call_id}/complete",
    response_model=CallDetailResponse,
    summary="Complete a call, execute conversational analysis, and generate training recommendations",
)
def complete_call(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    """
    Lifecycle endpoint:
    Marks call as 'completed', runs AnalysisService to produce evaluation scorecard,
    and runs TrainingService to generate personalized training modules.
    """
    call = call_service.get_call_by_id(db=db, call_id=call_id, manager_id=current_user.id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Call '{call_id}' not found.")

    analysis = analysis_service.analyze_call(db=db, call_id=call_id)
    training_service.generate_modules_for_call(db=db, call_id=call_id, analysis=analysis)

    db.refresh(call)
    data = call.to_dict(include_details=True)
    data["recommended_training"] = [tm.to_dict() for tm in (call.training_modules or [])]
    return data
