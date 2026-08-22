import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import Call, CallAnalysis, CallTranscript, CallQuestion
from app.services.gemini_service import gemini_service


class AnalysisService:
    """
    Analysis Service Boundary:
    Evaluates completed calls based on the 5 questions and spoken transcript dialogue using Gemini AI.
    """

    @staticmethod
    def analyze_call(
        db: Session,
        call_id: str,
        custom_analysis: Optional[Dict[str, Any]] = None,
    ) -> CallAnalysis:
        """
        Produce or persist normalized evaluation analysis for a call using Gemini.
        """
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found.")

        # If custom analysis payload provided (e.g. from explicit test injection)
        if custom_analysis:
            analysis_data = custom_analysis
        else:
            # Extract 5 questions and matching employee answers
            questions: List[CallQuestion] = (
                db.query(CallQuestion)
                .filter(CallQuestion.call_id == call_id)
                .order_by(CallQuestion.question_number.asc())
                .all()
            )
            transcripts: List[CallTranscript] = (
                db.query(CallTranscript)
                .filter(CallTranscript.call_id == call_id)
                .order_by(CallTranscript.created_at.asc())
                .all()
            )

            emp_answers = [t.text for t in transcripts if t.speaker == "employee"]

            qa_pairs = []
            for i, q in enumerate(questions):
                ans = emp_answers[i] if i < len(emp_answers) else ""
                qa_pairs.append({
                    "question": q.question_text,
                    "answer": ans,
                })

            employee_name = call.employee.name if call.employee else "Sales Representative"
            employee_id = call.employee_id

            # Evaluate with Gemini
            analysis_data = gemini_service.analyze_call_transcript(
                employee_name=employee_name,
                employee_id=employee_id,
                call_id=call_id,
                qa_pairs=qa_pairs,
            )

        metrics = analysis_data.get("metrics", {})
        
        # Calculate overall score deterministically from the 7 skill dimensions
        skill_keys = ["empathy", "communication", "discovery", "objectionHandling", "solutionOffering", "closing", "compliance"]
        extracted_scores = [metrics[k] for k in skill_keys if k in metrics and isinstance(metrics[k], (int, float))]
        if extracted_scores:
            overall_score = round(sum(extracted_scores) / len(extracted_scores))
        else:
            overall_score = analysis_data.get("overall_score", 80)

        strengths = analysis_data.get("strengths", [])
        weaknesses = analysis_data.get("weaknesses", [])
        recommendations = analysis_data.get("recommendations", analysis_data.get("skill_gaps", []))
        summary = analysis_data.get("summary", f"Representative achieved a calculated overall QA score of {overall_score}/100.")
        insights = analysis_data.get("insights", [])
        question_evaluations = analysis_data.get("question_evaluations", [])

        # Upsert call analysis record
        existing = db.query(CallAnalysis).filter(CallAnalysis.call_id == call_id).first()
        if existing:
            existing.overall_score = overall_score
            existing.metrics = metrics
            existing.strengths = strengths
            existing.weaknesses = weaknesses
            existing.recommendations = recommendations
            existing.summary = summary
            existing.insights = insights
            existing.question_evaluations = question_evaluations
            db.commit()
            db.refresh(existing)
            return existing

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
            insights=insights,
            question_evaluations=question_evaluations,
        )
        db.add(new_analysis)

        # Ensure call is marked completed
        if call.status != "completed":
            call.status = "completed"

        db.commit()
        db.refresh(new_analysis)
        return new_analysis


analysis_service = AnalysisService()
