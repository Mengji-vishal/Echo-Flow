import uuid
from datetime import datetime, timezone
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
    def get_manager_calls(db: Session, manager_id: Optional[str] = None) -> List[Call]:
        """Retrieve all assessment calls in the platform."""
        return (
            db.query(Call)
            .order_by(Call.created_at.desc())
            .all()
        )

    @staticmethod
    def get_call_by_id(db: Session, call_id: str, manager_id: Optional[str] = None) -> Optional[Call]:
        """Retrieve a specific call by ID."""
        return db.query(Call).filter(Call.id == call_id).first()

    @staticmethod
    def add_transcript_entry(
        db: Session,
        call_id: str,
        speaker: str,
        text: str,
        timestamp: str,
        manager_id: Optional[str] = None,
    ) -> CallTranscript:
        """Add a conversation turn transcript entry to the call."""
        call = CallService.get_call_by_id(db, call_id)
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found.")

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
        call = CallService.get_call_by_id(db, call_id)
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found.")

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

    @staticmethod
    def seed_simulated_call(db: Session, call: Call) -> Call:
        """
        Populate a call with realistic dialogue turns for the 5 questions,
        enabling full end-to-end evaluation and training module generation
        even when Twilio trial is expired or telephony is offline.
        """
        SAMPLE_ANSWERS = [
            "We offer personal loans ranging from 50,000 up to 25 lakhs with flexible repayment tenures from 12 to 60 months depending on your monthly income and eligibility.",
            "You will need to submit standard KYC documents including PAN card, Aadhaar card, last 3 months salary slips, and 6 months bank statement showing regular salary credit.",
            "Our annual interest rates start from 10.5% per annum based on your CIBIL score. There is complete transparency with no hidden processing fees or charges.",
            "If an EMI payment is missed, a standard late payment charge applies and it may affect your credit score, but we offer a grace period and support to reschedule payments.",
            "We offer instant digital verification, minimal documentation, same-day sanction, and disbursement directly into your bank account within 24 hours.",
        ]

        call.status = "in_progress"
        if not call.provider_call_id or call.provider_call_id == "":
            call.provider_call_id = f"sim_{uuid.uuid4().hex[:10]}"
        if not call.started_at:
            call.started_at = datetime.now(timezone.utc)
        if not call.duration_seconds:
            call.duration_seconds = 75

        existing_emp_count = (
            db.query(CallTranscript)
            .filter(CallTranscript.call_id == call.id, CallTranscript.speaker == "employee")
            .count()
        )

        if existing_emp_count < 5:
            # Clear any partial transcripts for clean 10-turn dialogue
            db.query(CallTranscript).filter(CallTranscript.call_id == call.id).delete()
            db.commit()

            questions = sorted(call.questions, key=lambda q: q.question_number)
            timestamps = [
                ("00:00", "00:15"),
                ("00:15", "00:30"),
                ("00:30", "00:45"),
                ("00:45", "01:00"),
                ("01:00", "01:15"),
            ]

            for idx, q in enumerate(questions):
                q_ts, ans_ts = timestamps[idx] if idx < len(timestamps) else ("00:00", "00:15")
                emp_ans = SAMPLE_ANSWERS[idx] if idx < len(SAMPLE_ANSWERS) else "Yes, I understand and can confirm all requirements for you."

                ai_tr = CallTranscript(
                    id=f"tr_{uuid.uuid4().hex[:12]}",
                    call_id=call.id,
                    speaker="ai",
                    text=q.question_text,
                    timestamp=q_ts,
                )
                db.add(ai_tr)

                emp_tr = CallTranscript(
                    id=f"tr_{uuid.uuid4().hex[:12]}",
                    call_id=call.id,
                    speaker="employee",
                    text=emp_ans,
                    timestamp=ans_ts,
                )
                db.add(emp_tr)

            db.commit()

        db.refresh(call)
        return call


call_service = CallService()
