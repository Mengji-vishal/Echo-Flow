from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal


class TrainingModuleResponse(BaseModel):
    id: str
    employee_id: str
    source_call_id: Optional[str] = None
    title: str
    description: str
    skill_area: str
    difficulty: str = "Intermediate"
    estimated_duration: str = "20 mins"
    why_recommended: Optional[str] = None
    learning_objectives: List[str] = []
    content: Dict[str, Any] = {}
    progress: int = 0
    status: Literal["active", "in_progress", "completed"] = "active"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UpdateTrainingProgressRequest(BaseModel):
    progress: int = Field(..., ge=0, le=100, description="Module completion progress (0-100)")
    status: Optional[Literal["active", "in_progress", "completed"]] = None


class EmployeePerformanceSummaryResponse(BaseModel):
    employee_id: str
    employee_name: str
    employee_email: str
    total_calls: int
    completed_calls: int
    average_score: int
    latest_score: Optional[int] = None
    metrics_averages: Dict[str, int]
    top_strengths: List[str]
    focus_areas: List[str]
    recent_evaluations: List[Dict[str, Any]]
    recommended_modules_count: int
