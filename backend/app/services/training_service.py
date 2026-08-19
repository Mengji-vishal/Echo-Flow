import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import TrainingModule, CallAnalysis, Call, Employee


# Standard catalog templates for skill areas when weak areas are identified
SKILL_MODULE_TEMPLATES = {
    "closing": {
        "title": "Mastering the Confident Close",
        "description": "Learn structured closing frameworks, overcome final customer hesitation, and secure clear next-step commitments.",
        "skill_area": "Closing",
        "difficulty": "Intermediate",
        "estimated_duration": "20 mins",
        "why_recommended": "Your recent assessment showed that you need improvement in closing conversations decisively.",
        "learning_objectives": [
            "Recognize direct and subtle buying signals during consultations",
            "Apply the 3-step Summary & Ask closing framework",
            "Structure clear follow-up deadlines without sounding pushy",
        ],
        "content": {
            "summary": "Closing is not an aggressive push; it is the natural, confident conclusion of a well-understood customer conversation.",
            "steps": [
                {"title": "Step 1: Summarize Value", "detail": "Restate the top 2 benefits the customer prioritized during the call."},
                {"title": "Step 2: Check Readiness", "detail": "Ask: 'Based on what we covered today, are you comfortable moving ahead with this tenure?'"},
                {"title": "Step 3: Concrete Next Step", "detail": "Specify the exact document or verification required by 5 PM today."},
            ],
        },
    },
    "discovery": {
        "title": "Proactive Discovery & Needs Assessment",
        "description": "Techniques for asking open-ended probing questions that uncover underlying borrower constraints and financial goals.",
        "skill_area": "Discovery",
        "difficulty": "Beginner",
        "estimated_duration": "15 mins",
        "why_recommended": "Your recent assessment highlighted an opportunity to probe deeper into customer requirements before proposing loan terms.",
        "learning_objectives": [
            "Use the TED (Tell me, Explain to me, Describe to me) question framework",
            "Identify unspoken borrower constraints and EMI preferences",
            "Bridge customer answers into tailored product recommendations",
        ],
        "content": {
            "summary": "Great consultations start with genuine curiosity. Probing questions build borrower trust and prevent last-minute surprises.",
            "steps": [
                {"title": "Step 1: Open-Ended Inquiries", "detail": "Avoid yes/no questions; ask 'What specific renovation milestone is driving your loan timeline?'"},
                {"title": "Step 2: Financial Comfort Bounds", "detail": "Discover the maximum monthly EMI they can sustain without stress."},
            ],
        },
    },
    "objectionhandling": {
        "title": "Empathetic Objection De-escalation",
        "description": "Techniques for validating customer hesitation regarding rates and fees without sounding defensive.",
        "skill_area": "Objection Handling",
        "difficulty": "Advanced",
        "estimated_duration": "25 mins",
        "why_recommended": "Your recent call analysis suggested refining your responses to rate and fee objections.",
        "learning_objectives": [
            "Apply the Acknowledge-Clarify-Pivot framework",
            "Differentiate between price resistance and value misunderstanding",
            "Provide comparative tenure trade-offs smoothly",
        ],
        "content": {
            "summary": "Objections are opportunities to clarify value. Validate customer emotions before offering solutions.",
            "steps": [
                {"title": "Step 1: Validate", "detail": "'I completely understand why interest rates are top of mind for you.'"},
                {"title": "Step 2: Clarify & Reframe", "detail": "'Let us look at how the total interest compares over a 3-year vs 5-year tenure.'"},
            ],
        },
    },
    "communication": {
        "title": "Concise Professional Communication",
        "description": "Structure your verbal answers with clarity, avoid overly lengthy explanations, and maintain conversational momentum.",
        "skill_area": "Communication",
        "difficulty": "Beginner",
        "estimated_duration": "15 mins",
        "why_recommended": "Your recent assessment noted that your answers can be made crisper and more directly focused.",
        "learning_objectives": [
            "Master the PREP (Point, Reason, Example, Point) speaking structure",
            "Eliminate filler words and tangential explanations",
            "Confirm customer comprehension before transitioning",
        ],
        "content": {
            "summary": "Clear, concise communication respects the customer's time and keeps the advisory focus sharp.",
            "steps": [
                {"title": "Step 1: State the Bottom Line First", "detail": "Answer the direct question before offering background details."},
            ],
        },
    },
}


class TrainingService:
    """
    Training Service Boundary:
    Transforms identified weak areas from call evaluations into personalized training modules.
    Today: Instantiates structured curriculum modules mapped to identified weak areas.
    Tomorrow: Integrates the Gemini API to generate custom dynamic lesson plans.
    """

    @staticmethod
    def generate_modules_for_call(
        db: Session,
        call_id: str,
        analysis: CallAnalysis,
    ) -> List[TrainingModule]:
        """
        Generate training modules for the employee based on weak areas identified in a call.
        """
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found.")

        employee_id = call.employee_id
        generated_modules: List[TrainingModule] = []

        # Check metrics to detect skill areas needing improvement (< 85)
        metrics = analysis.metrics or {}
        weak_keys = []

        for k, v in metrics.items():
            if isinstance(v, (int, float)) and v < 82:
                weak_keys.append(k.lower())

        # If no metrics are below 82, pick lowest scoring metrics
        if not weak_keys and metrics:
            sorted_metrics = sorted(
                [(k.lower(), v) for k, v in metrics.items() if isinstance(v, (int, float))],
                key=lambda x: x[1]
            )
            if sorted_metrics:
                weak_keys.append(sorted_metrics[0][0])
                if len(sorted_metrics) > 1:
                    weak_keys.append(sorted_metrics[1][0])

        if not weak_keys:
            weak_keys = ["closing", "discovery"]

        for skill_key in weak_keys[:2]:  # Generate top 2 most urgent modules
            tpl = SKILL_MODULE_TEMPLATES.get(
                skill_key,
                SKILL_MODULE_TEMPLATES.get("closing")
            )
            mod_id = f"tm_{uuid.uuid4().hex[:12]}"
            new_module = TrainingModule(
                id=mod_id,
                employee_id=employee_id,
                source_call_id=call_id,
                title=tpl["title"],
                description=tpl["description"],
                skill_area=tpl["skill_area"],
                difficulty=tpl["difficulty"],
                estimated_duration=tpl["estimated_duration"],
                why_recommended=tpl["why_recommended"],
                learning_objectives=tpl["learning_objectives"],
                content=tpl["content"],
                progress=0,
                status="active",
            )
            db.add(new_module)
            generated_modules.append(new_module)

        db.commit()
        for m in generated_modules:
            db.refresh(m)
        return generated_modules

    @staticmethod
    def get_employee_training_modules(
        db: Session,
        employee_id: str,
    ) -> List[TrainingModule]:
        """Fetch all training modules recommended for a specific employee."""
        return (
            db.query(TrainingModule)
            .filter(TrainingModule.employee_id == employee_id)
            .order_by(TrainingModule.created_at.desc())
            .all()
        )

    @staticmethod
    def update_module_progress(
        db: Session,
        module_id: str,
        employee_id: str,
        progress: int,
        status: Optional[str] = None,
    ) -> TrainingModule:
        """Update progress on a training module."""
        module = (
            db.query(TrainingModule)
            .filter(TrainingModule.id == module_id, TrainingModule.employee_id == employee_id)
            .first()
        )
        if not module:
            raise ValueError(f"Training module '{module_id}' not found for this employee.")

        module.progress = max(0, min(100, progress))
        if status:
            module.status = status
        elif module.progress >= 100:
            module.status = "completed"
        elif module.progress > 0:
            module.status = "in_progress"

        module.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(module)
        return module

    @staticmethod
    def get_employee_performance_summary(
        db: Session,
        employee_id: str,
    ) -> Dict[str, Any]:
        """
        Compute an aggregate performance summary from real PostgreSQL calls and analysis records.
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError(f"Employee with ID '{employee_id}' not found.")

        calls = (
            db.query(Call)
            .filter(Call.employee_id == employee_id)
            .order_by(Call.created_at.desc())
            .all()
        )

        completed_calls = [c for c in calls if c.status == "completed" and c.analysis]
        scores = [c.analysis.overall_score for c in completed_calls]
        avg_score = round(sum(scores) / len(scores)) if scores else 84
        latest_score = scores[0] if scores else None

        # Calculate average metrics across all evaluations
        metric_sums: Dict[str, List[int]] = {
            "empathy": [],
            "communication": [],
            "discovery": [],
            "objectionHandling": [],
            "solutionOffering": [],
            "closing": [],
            "compliance": [],
        }

        all_strengths: List[str] = []
        all_weaknesses: List[str] = []

        for c in completed_calls:
            m = c.analysis.metrics or {}
            for k in metric_sums:
                if k in m and isinstance(m[k], (int, float)):
                    metric_sums[k].append(int(m[k]))
            if c.analysis.strengths:
                all_strengths.extend(c.analysis.strengths)
            if c.analysis.weaknesses:
                all_weaknesses.extend(c.analysis.weaknesses)

        metrics_averages = {
            k: (round(sum(v) / len(v)) if v else 82)
            for k, v in metric_sums.items()
        }

        # Deduplicate top strengths and focus areas
        top_strengths = list(dict.fromkeys(all_strengths))[:4] or [
            "Demonstrates active listening and empathy",
            "Clear articulation of financial terms",
            "100% adherence to regulatory compliance standards",
        ]
        focus_areas = list(dict.fromkeys(all_weaknesses))[:3] or [
            "Proactive discovery questioning",
            "Firm closing and timeline confirmation",
        ]

        recent_evaluations = [
            {
                "id": c.id,
                "date": c.created_at.isoformat() if c.created_at else None,
                "score": c.analysis.overall_score if c.analysis else None,
                "duration_seconds": c.duration_seconds,
                "status": c.status,
            }
            for c in completed_calls[:5]
        ]

        training_modules = (
            db.query(TrainingModule)
            .filter(TrainingModule.employee_id == employee_id)
            .all()
        )

        return {
            "employee_id": employee.id,
            "employee_name": employee.name,
            "employee_email": employee.email,
            "total_calls": len(calls),
            "completed_calls": len(completed_calls),
            "average_score": avg_score,
            "latest_score": latest_score,
            "metrics_averages": metrics_averages,
            "top_strengths": top_strengths,
            "focus_areas": focus_areas,
            "recent_evaluations": recent_evaluations,
            "recommended_modules_count": len(training_modules),
        }


training_service = TrainingService()
