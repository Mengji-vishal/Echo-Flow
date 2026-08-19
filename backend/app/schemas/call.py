from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Literal
from app.schemas.training import TrainingModuleResponse


class CreateCallRequest(BaseModel):
    employee_id: str = Field(..., description="Target Employee ID")
    questions: List[str] = Field(..., description="Exactly 5 assessment questions for the AI caller")

    @field_validator("questions")
    @classmethod
    def validate_five_questions(cls, v: List[str]) -> List[str]:
        cleaned = [q.strip() for q in v if q and q.strip()]
        if len(cleaned) != 5:
            raise ValueError(f"Exactly 5 non-empty questions are required for an assessment call. Provided {len(cleaned)}.")
        return cleaned


class CallQuestionResponse(BaseModel):
    id: str
    call_id: str
    question_number: int
    question_text: str
    created_at: Optional[str] = None


class CreateTranscriptRequest(BaseModel):
    speaker: Literal["ai", "employee"] = Field(..., description="Speaker: 'ai' or 'employee'")
    text: str = Field(..., min_length=1, description="Transcript text")
    timestamp: str = Field(..., description="Timestamp offset (e.g. '0:15')")


class CallTranscriptResponse(BaseModel):
    id: str
    call_id: str
    speaker: str
    text: str
    timestamp: str
    created_at: Optional[str] = None


class QuestionEvaluation(BaseModel):
    question_number: int
    question_text: str
    employee_answer: Optional[str] = None
    score: int = Field(..., ge=0, le=100)
    feedback: str
    key_observation: Optional[str] = None


class CreateAnalysisRequest(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall score between 0 and 100")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="7 Skill metrics breakdown")
    strengths: List[str] = Field(default_factory=list, description="Key strengths observed")
    weaknesses: List[str] = Field(default_factory=list, description="Key focus areas / weaknesses")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations")
    summary: Optional[str] = Field(default=None, description="Executive summary of call performance")
    insights: List[str] = Field(default_factory=list, description="Qualitative communication and behavioral insights")
    question_evaluations: List[Dict[str, Any]] = Field(default_factory=list, description="Per-question evaluation and feedback")


class CallAnalysisResponse(BaseModel):
    id: str
    call_id: str
    overall_score: int
    metrics: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    summary: Optional[str] = None
    insights: List[str] = []
    question_evaluations: List[Dict[str, Any]] = []
    created_at: Optional[str] = None


class CallSummaryResponse(BaseModel):
    id: str
    manager_id: str
    employee_id: str
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    status: str
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    provider_call_id: Optional[str] = None
    questions_count: int = 5
    overall_score: Optional[int] = None
    created_at: str


class CallDetailResponse(BaseModel):
    id: str
    manager_id: str
    employee_id: str
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    status: str
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    provider_call_id: Optional[str] = None
    created_at: str
    questions: List[CallQuestionResponse]
    transcripts: List[CallTranscriptResponse] = []
    analysis: Optional[CallAnalysisResponse] = None
    recommended_training: List[TrainingModuleResponse] = []


class EmployeeItemResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str = "employee"
    created_at: Optional[str] = None
