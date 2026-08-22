import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import TrainingModule, CallAnalysis, Call, Employee, TrainingQuiz, QuizAttempt
from app.services.gemini_service import gemini_service

# Rich curriculum templates for personalized skill coaching modules
SKILL_MODULE_TEMPLATES = {
    "objection handling": {
        "title": "Mastering Interest Rate & Fee Objection Handling",
        "description": "Techniques for validating customer hesitation regarding interest rate structures and loan tenure without sounding defensive.",
        "skill_area": "Objection Handling",
        "difficulty": "Intermediate",
        "estimated_duration": "20 mins",
        "learning_objectives": [
            "Apply the Acknowledge-Clarify-Pivot framework to rate objections",
            "Differentiate between fixed APR certainty and floating benchmark trade-offs",
            "Present comparative amortization examples clearly",
        ],
        "content": {
            "summary": "Objections around interest rates and EMIs are opportunities to clarify value and establish borrower trust.",
            "framework": "Listen → Acknowledge → Clarify Underlying Concern → Provide Comparative Value → Confirm Understanding",
            "steps": [
                {"title": "Step 1: Acknowledge Genuinely", "detail": "Acknowledge the customer's financial concern without becoming defensive."},
                {"title": "Step 2: Clarify & Compare", "detail": "Explain the exact APR formula, prepayment privileges, and total cost of borrowing."},
                {"title": "Step 3: Concrete Solution", "detail": "Demonstrate total interest savings across a 3-year vs 5-year tenure option."},
            ],
            "key_concepts": [
                "Acknowledge the customer's financial concern genuinely",
                "Explain the exact APR formula and prepayment privileges",
                "Demonstrate total savings across multiple tenure options",
            ],
            "script_examples": [
                {"scenario": "Customer asks: 'Are interest rates fixed or floating?'", "recommended_response": "'We offer both options. A fixed rate guarantees your monthly EMI never changes, while a floating rate tracks the benchmark repo rate.'"},
            ],
            "practice_exercise": "Practice responding to three common customer objections regarding prepayment penalties and EMI calculations.",
        },
    },
    "discovery": {
        "title": "Proactive Borrower Discovery & Needs Assessment",
        "description": "Techniques for asking open-ended probing questions that uncover underlying borrower constraints and financial goals.",
        "skill_area": "Discovery",
        "difficulty": "Beginner",
        "estimated_duration": "15 mins",
        "learning_objectives": [
            "Use the TED (Tell me, Explain to me, Describe to me) question framework",
            "Identify unspoken borrower constraints and monthly disposable income boundaries",
            "Bridge customer answers into tailored product recommendations",
        ],
        "content": {
            "summary": "Great consultations start with genuine curiosity. Probing questions build borrower trust and prevent last-minute surprises.",
            "framework": "Ask Open-Ended Question → Active Listening → Clarify Constraint → Bridge to Tailored Option",
            "steps": [
                {"title": "Step 1: Open Inquiries", "detail": "Avoid closed yes/no questions; explore borrower timeline and purpose."},
                {"title": "Step 2: Comfort Bounds", "detail": "Discover the maximum monthly EMI they can sustain comfortably."},
            ],
            "key_concepts": [
                "Avoid simple yes/no questions",
                "Discover the maximum monthly EMI they can sustain comfortably",
            ],
            "script_examples": [
                {"scenario": "Verifying loan requirement", "recommended_response": "'Could you tell me a little more about your timeline for this personal loan so we can structure the best disbursement plan?'"},
            ],
            "practice_exercise": "Formulate 5 open-ended discovery questions for a borrower with existing debt obligations.",
        },
    },
    "compliance": {
        "title": "Regulatory Income & Disclosure Verification",
        "description": "Ensure thorough adherence to income verification, tax documentation, and mandatory regulatory disclosures.",
        "skill_area": "Compliance & Verification",
        "difficulty": "Intermediate",
        "estimated_duration": "15 mins",
        "learning_objectives": [
            "Master mandatory verification disclosures during sales calls",
            "Verify net disposable income and tax deductions accurately",
            "Record existing credit card and vehicle loan liabilities",
        ],
        "content": {
            "summary": "Adhering strictly to lending disclosures protects both the customer and the institution.",
            "framework": "Verify Salary & Deductions → Check Existing Liabilities → Disclose Fee Schedule → Confirm Agreement",
            "steps": [
                {"title": "Step 1: Verification Standards", "detail": "Verify salary slips and banking credit statements thoroughly."},
                {"title": "Step 2: Mandatory Disclosures", "detail": "Explicitly disclose processing fees, foreclosure terms, and APR."},
            ],
            "key_concepts": [
                "Verification standards for salary slips and bank statements",
                "Disclosure of processing fees and foreclosure charges",
            ],
            "script_examples": [
                {"scenario": "Disclosing EMI schedule", "recommended_response": "'Before we proceed, let me confirm your monthly take-home salary and outline the exact fee schedule.'"},
            ],
            "practice_exercise": "Review a mock loan file and identify 3 compliance verification checkboxes.",
        },
    },
    "communication": {
        "title": "Crisp & Professional Financial Communication",
        "description": "Structure your verbal answers with clarity, avoid overly lengthy explanations, and maintain conversational momentum.",
        "skill_area": "Communication",
        "difficulty": "Beginner",
        "estimated_duration": "15 mins",
        "learning_objectives": [
            "Master the PREP (Point, Reason, Example, Point) speaking structure",
            "Eliminate filler words and ambiguous financial jargon",
            "Confirm customer comprehension before transitioning topics",
        ],
        "content": {
            "summary": "Clear, concise communication respects the customer's time and keeps the advisory focus sharp.",
            "framework": "Point (Bottom line) → Reason (Why) → Example (Illustration) → Point (Confirmation)",
            "steps": [
                {"title": "Step 1: State Bottom Line", "detail": "Deliver the direct answer first before offering supporting context."},
                {"title": "Step 2: Check Comprehension", "detail": "Confirm borrower alignment before moving forward."},
            ],
            "key_concepts": [
                "State the bottom-line answer first before providing background",
                "Check for customer agreement at key milestones",
            ],
            "script_examples": [
                {"scenario": "Explaining EMI tenure", "recommended_response": "'Your 4-year tenure keeps your monthly EMI at exactly eleven thousand rupees, which comfortably fits your budget.'"},
            ],
            "practice_exercise": "Record a 60-second summary of a personal loan product using the PREP structure.",
        },
    },
    "closing": {
        "title": "Mastering the Confident Consultation Close",
        "description": "Learn structured closing frameworks, overcome final customer hesitation, and secure clear next-step commitments.",
        "skill_area": "Closing",
        "difficulty": "Intermediate",
        "estimated_duration": "20 mins",
        "learning_objectives": [
            "Recognize direct and subtle buying signals during consultations",
            "Apply the 3-step Summary & Ask closing framework",
            "Structure clear follow-up deadlines without sounding pushy",
        ],
        "content": {
            "summary": "Closing is the natural, confident conclusion of a well-understood customer consultation.",
            "framework": "Summarize Key Benefits → Check Readiness → Confirm Next Step & Deadline",
            "steps": [
                {"title": "Step 1: Value Recap", "detail": "Restate the primary benefits prioritized by the customer."},
                {"title": "Step 2: Milestone Agreement", "detail": "Set a firm deadline for documentation submission."},
            ],
            "key_concepts": [
                "Summarize the top benefits the customer prioritized",
                "Confirm documentation deadlines unambiguously",
            ],
            "script_examples": [
                {"scenario": "Finalizing next steps", "recommended_response": "'We have selected the 4-year plan with lowest interest. Shall I send over the pre-approval link to your email now?'"},
            ],
            "practice_exercise": "Simulate a consultation close confirming KYC document submission.",
        },
    },
}


class TrainingService:
    """
    Training Service Boundary:
    Transforms identified weak areas and skill gaps from Gemini evaluations into personalized training modules,
    manages interactive learning completion, and administers secure dynamic quizzes.
    """

    @staticmethod
    def generate_modules_for_call(
        db: Session,
        call_id: str,
        analysis: CallAnalysis,
    ) -> List[TrainingModule]:
        """
        Generate personalized training modules for the employee based on skill gaps and weak metrics from Gemini evaluation.
        """
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            raise ValueError(f"Call with ID '{call_id}' not found.")

        employee_id = call.employee_id
        generated_modules: List[TrainingModule] = []

        # 1. Inspect identified skill gaps from Gemini
        skill_gaps = []
        if isinstance(analysis.recommendations, list):
            skill_gaps.extend(analysis.recommendations)

        # 2. Inspect metric scores to find lowest scoring areas (< 80)
        metrics = analysis.metrics or {}
        weak_keys = []
        for k, v in metrics.items():
            if isinstance(v, (int, float)) and v < 80:
                weak_keys.append(k.lower())

        if not weak_keys and metrics:
            sorted_m = sorted(
                [(k.lower(), v) for k, v in metrics.items() if isinstance(v, (int, float))],
                key=lambda x: x[1]
            )
            weak_keys = [k for k, _ in sorted_m[:2]]

        # Determine target skill areas to generate modules for
        target_skills = []
        for gap in skill_gaps:
            if isinstance(gap, dict) and gap.get("skill"):
                s = gap["skill"].lower()
                if "rate" in s or "objection" in s:
                    target_skills.append("objection handling")
                elif "income" in s or "compliance" in s or "verif" in s:
                    target_skills.append("compliance")
                elif "discover" in s or "question" in s:
                    target_skills.append("discovery")
                elif "communicat" in s or "clarity" in s:
                    target_skills.append("communication")
                elif "close" in s or "next" in s:
                    target_skills.append("closing")

        for wk in weak_keys:
            if "objection" in wk or "problem" in wk:
                target_skills.append("objection handling")
            elif "discovery" in wk or "product" in wk:
                target_skills.append("discovery")
            elif "compliance" in wk or "accuracy" in wk:
                target_skills.append("compliance")
            elif "communication" in wk:
                target_skills.append("communication")
            elif "closing" in wk or "confidence" in wk:
                target_skills.append("closing")

        target_skills = list(dict.fromkeys(target_skills))
        if not target_skills:
            target_skills = ["objection handling", "discovery"]

        for skill_key in target_skills[:2]:
            tpl = SKILL_MODULE_TEMPLATES.get(
                skill_key,
                SKILL_MODULE_TEMPLATES.get("objection handling")
            )

            # Avoid duplicates if module already exists for this call
            existing = (
                db.query(TrainingModule)
                .filter(
                    TrainingModule.source_call_id == call_id,
                    TrainingModule.title == tpl["title"]
                )
                .first()
            )
            if existing:
                generated_modules.append(existing)
                continue

            why_rec = (
                f"Recommended based on your assessment call. "
                f"Evaluation identified an opportunity to strengthen {tpl['skill_area']}."
            )
            if analysis.weaknesses and len(analysis.weaknesses) > 0:
                why_rec += f" Specific focus: {analysis.weaknesses[0]}"

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
                why_recommended=why_rec,
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
    def complete_module_learning(
        db: Session,
        module_id: str,
        employee_id: str,
    ) -> TrainingModule:
        """Mark the learning document as studied and prepare module for quiz."""
        module = (
            db.query(TrainingModule)
            .filter(TrainingModule.id == module_id, TrainingModule.employee_id == employee_id)
            .first()
        )
        if not module:
            raise ValueError(f"Training module '{module_id}' not found for this employee.")

        if module.status != "completed":
            module.status = "ready_for_quiz"
            module.progress = max(module.progress, 50)
            module.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(module)

        return module

    @staticmethod
    def get_or_create_module_quiz(
        db: Session,
        module_id: str,
        employee_id: str,
    ) -> Dict[str, Any]:
        """
        Get or dynamically generate a 5-question multiple choice quiz for a training module using Gemini.
        Returns client-safe question list (correct answers stripped).
        """
        module = (
            db.query(TrainingModule)
            .filter(TrainingModule.id == module_id, TrainingModule.employee_id == employee_id)
            .first()
        )
        if not module:
            raise ValueError(f"Training module '{module_id}' not found for this employee.")

        # Check if quiz already exists in PostgreSQL
        quiz = db.query(TrainingQuiz).filter(TrainingQuiz.module_id == module_id).first()
        if not quiz:
            # Generate 5 questions strictly derived from this module's learning material
            questions = gemini_service.generate_quiz_for_module(
                module_title=module.title,
                skill_area=module.skill_area,
                learning_objectives=module.learning_objectives or [],
                content=module.content or {},
            )

            quiz_id = f"qz_{uuid.uuid4().hex[:12]}"
            quiz = TrainingQuiz(
                id=quiz_id,
                module_id=module_id,
                employee_id=employee_id,
                title=f"Comprehension Check: {module.title}",
                questions=questions,
            )
            db.add(quiz)
            db.commit()
            db.refresh(quiz)

        return quiz.to_client_dict()

    @staticmethod
    def submit_quiz_attempt(
        db: Session,
        module_id: str,
        employee_id: str,
        submitted_answers: List[int],
    ) -> Dict[str, Any]:
        """
        Evaluate employee's submitted quiz answers, persist attempt, and update training progress.
        """
        module = (
            db.query(TrainingModule)
            .filter(TrainingModule.id == module_id, TrainingModule.employee_id == employee_id)
            .first()
        )
        if not module:
            raise ValueError(f"Training module '{module_id}' not found for this employee.")

        quiz = db.query(TrainingQuiz).filter(TrainingQuiz.module_id == module_id).first()
        if not quiz:
            raise ValueError(f"No quiz found for module '{module_id}'. Please open the quiz first.")

        questions = quiz.questions or []
        total_q = len(questions)
        if total_q == 0:
            raise ValueError("Quiz has no questions configured.")

        correct_count = 0
        review_feedback = []

        for i, q in enumerate(questions):
            ans_given = submitted_answers[i] if i < len(submitted_answers) else -1
            correct_ans = q.get("correct_answer", 0)
            is_correct = (ans_given == correct_ans)

            if is_correct:
                correct_count += 1

            review_feedback.append({
                "question_number": i + 1,
                "question": q.get("question", ""),
                "selected_option": ans_given,
                "is_correct": is_correct,
                "explanation": q.get("explanation", "Review the learning material for detailed concepts."),
            })

        score = round((correct_count / total_q) * 100)
        passed = (score >= 80)

        # Update module status and progress
        if passed:
            module.status = "completed"
            module.progress = 100
        else:
            module.status = "in_progress"
            module.progress = max(module.progress, 70)
        module.updated_at = datetime.now(timezone.utc)

        # Record attempt
        attempt_id = f"qa_{uuid.uuid4().hex[:12]}"
        attempt = QuizAttempt(
            id=attempt_id,
            quiz_id=quiz.id,
            employee_id=employee_id,
            score=score,
            correct_count=correct_count,
            total_questions=total_q,
            passed=passed,
            submitted_answers=submitted_answers,
            review_feedback=review_feedback,
        )
        db.add(attempt)
        db.commit()
        db.refresh(module)

        return {
            "score": score,
            "correct_count": correct_count,
            "total_questions": total_q,
            "passed": passed,
            "module_progress": module.progress,
            "module_status": module.status,
            "review_feedback": review_feedback,
        }

    @staticmethod
    def get_employee_performance_summary(
        db: Session,
        employee_id: str,
    ) -> Dict[str, Any]:
        """
        Compute aggregate performance summary from real PostgreSQL calls and analysis records.
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
        avg_score = round(sum(scores) / len(scores)) if scores else 0
        latest_score = scores[0] if scores else None

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
            k: (round(sum(v) / len(v)) if v else 0)
            for k, v in metric_sums.items()
        }

        top_strengths = list(dict.fromkeys(all_strengths))[:4]
        focus_areas = list(dict.fromkeys(all_weaknesses))[:3]

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
