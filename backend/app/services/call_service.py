import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Manager, Employee, Call, CallQuestion, CallTranscript, CallAnalysis


class CallService:
    @staticmethod
    def list_employees(db: Session) -> List[Employee]:
        """Fetch list of all active employees from employees table."""
        return db.query(Employee).order_by(Employee.name.asc()).all()

    @staticmethod
    def create_call(
        db: Session,
        manager_id: str,
        employee_id: str,
        questions: List[str],
    ) -> Call:
        """
        Create a new assessment call with exactly 5 questions.
        Initial status: 'created'.
        """
        # Validate manager exists
        manager = db.query(Manager).filter(Manager.id == manager_id).first()
        if not manager:
            raise ValueError(f"Manager with ID '{manager_id}' does not exist.")

        # Validate employee exists
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError(f"Employee with ID '{employee_id}' does not exist.")

        if len(questions) != 5:
            raise ValueError(f"Exactly 5 questions required. Received {len(questions)}.")

        call_id = f"call_{uuid.uuid4().hex[:12]}"
        new_call = Call(
            id=call_id,
            manager_id=manager_id,
            employee_id=employee_id,
            status="created",
        )
        db.add(new_call)

        # Create exactly 5 question records
        for idx, q_text in enumerate(questions, start=1):
            q_id = f"cq_{uuid.uuid4().hex[:12]}"
            question_record = CallQuestion(
                id=q_id,
                call_id=call_id,
                question_number=idx,
                question_text=q_text.strip(),
            )
            db.add(question_record)

        db.commit()
        db.refresh(new_call)
        return new_call

    @staticmethod
    def get_manager_calls(db: Session, manager_id: str) -> List[Call]:
        """Retrieve all assessment calls initiated by the authenticated manager."""
        return (
            db.query(Call)
            .filter(Call.manager_id == manager_id)
            .order_by(Call.created_at.desc())
            .all()
        )

    @staticmethod
    def get_call_by_id(db: Session, call_id: str, manager_id: str) -> Optional[Call]:
        """Retrieve a specific call if it belongs to the authenticated manager."""
        return (
            db.query(Call)
            .filter(Call.id == call_id, Call.manager_id == manager_id)
            .first()
        )

    @staticmethod
    def add_transcript_entry(
        db: Session,
        call_id: str,
        manager_id: str,
        speaker: str,
        text: str,
        timestamp: str,
    ) -> CallTranscript:
        """Add a conversation turn transcript entry to the call."""
        call = CallService.get_call_by_id(db, call_id, manager_id)
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found or access denied.")

        tr_id = f"tr_{uuid.uuid4().hex[:12]}"
        entry = CallTranscript(
            id=tr_id,
            call_id=call_id,
            speaker=speaker,
            text=text.strip(),
            timestamp=timestamp.strip(),
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def save_analysis(
        db: Session,
        call_id: str,
        manager_id: str,
        overall_score: int,
        metrics: Dict[str, Any],
        strengths: List[str],
        weaknesses: List[str],
        recommendations: List[str],
        summary: Optional[str] = None,
    ) -> CallAnalysis:
        """Save AI analysis and skill breakdown results for a call."""
        call = CallService.get_call_by_id(db, call_id, manager_id)
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found or access denied.")

        existing_analysis = db.query(CallAnalysis).filter(CallAnalysis.call_id == call_id).first()

        if existing_analysis:
            existing_analysis.overall_score = overall_score
            existing_analysis.metrics = metrics
            existing_analysis.strengths = strengths
            existing_analysis.weaknesses = weaknesses
            existing_analysis.recommendations = recommendations
            existing_analysis.summary = summary
            db.commit()
            db.refresh(existing_analysis)
            return existing_analysis

        an_id = f"an_{uuid.uuid4().hex[:12]}"
        new_analysis = CallAnalysis(
            id=an_id,
            call_id=call_id,
            overall_score=overall_score,
            metrics=metrics,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            summary=summary,
        )
        db.add(new_analysis)

        # Mark call as completed if not already set
        if call.status in ("created", "in_progress", "ringing"):
            call.status = "completed"

        db.commit()
        db.refresh(new_analysis)
        return new_analysis


call_service = CallService()
