import re
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth_middleware import require_manager, UserResponse
from app.db.models import Employee, Call


router = APIRouter(prefix="/manager", tags=["Manager Analytics"])


def format_skill_name(name: str) -> str:
    # camelCase to Title Case e.g. objectionHandling -> Objection Handling
    s = re.sub(r"([A-Z])", r" \1", name)
    return s.strip().title()


@router.get(
    "/analytics",
    summary="Get aggregated team performance analytics and competency scorecards",
)
def get_team_analytics(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    employees = db.query(Employee).order_by(Employee.name.asc()).all()

    team_members_data: List[Dict[str, Any]] = []
    total_scores = []
    metric_accumulators: Dict[str, List[int]] = {
        "empathy": [],
        "communication": [],
        "discovery": [],
        "objectionHandling": [],
        "solutionOffering": [],
        "closing": [],
        "compliance": [],
    }

    for emp in employees:
        calls = (
            db.query(Call)
            .filter(Call.employee_id == emp.id, Call.status == "completed")
            .order_by(Call.created_at.desc())
            .all()
        )
        emp_scores = [c.analysis.overall_score for c in calls if c.analysis]
        avg_score = round(sum(emp_scores) / len(emp_scores)) if emp_scores else 0
        latest_score = emp_scores[0] if emp_scores else 0
        if emp_scores:
            total_scores.extend(emp_scores)

        # Competency metrics
        emp_metric_sums: Dict[str, List[int]] = {k: [] for k in metric_accumulators}
        for c in calls:
            if c.analysis and c.analysis.metrics:
                for k in metric_accumulators:
                    val = c.analysis.metrics.get(k)
                    if isinstance(val, (int, float)):
                        emp_metric_sums[k].append(int(val))
                        metric_accumulators[k].append(int(val))

        emp_metrics = {
            k: (round(sum(v) / len(v)) if v else 0)
            for k, v in emp_metric_sums.items()
        }

        # Determine strongest and weakest skill only if employee has evaluated calls
        if emp_scores:
            sorted_skills = sorted(emp_metrics.items(), key=lambda x: x[1], reverse=True)
            strongest = format_skill_name(sorted_skills[0][0])
            weakest = format_skill_name(sorted_skills[-1][0])
        else:
            strongest = "N/A"
            weakest = "N/A"

        team_members_data.append({
            "id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "role": "Representative",
            "qa_score": avg_score,
            "latest_score": latest_score,
            "total_calls": len(calls),
            "strongest_skill": strongest,
            "weakest_skill": weakest,
            "skills": emp_metrics,
        })

    team_avg_score = round(sum(total_scores) / len(total_scores)) if total_scores else 0

    team_competency_breakdown = {
        k: (round(sum(v) / len(v)) if v else 0)
        for k, v in metric_accumulators.items()
    }

    return {
        "team_size": len(employees),
        "team_average_score": team_avg_score,
        "team_competency_breakdown": team_competency_breakdown,
        "employees": team_members_data,
    }
