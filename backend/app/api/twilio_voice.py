import logging
import uuid
from datetime import datetime, timezone
from urllib.parse import parse_qs
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Call, CallQuestion, CallTranscript
from app.services.voice_service import voice_service
from app.services.analysis_service import analysis_service
from app.services.training_service import training_service

logger = logging.getLogger("twilio_voice")

router = APIRouter(prefix="/twilio", tags=["Twilio Voice & Webhooks"])


def format_timestamp(elapsed_secs: float) -> str:
    """Format elapsed seconds as MM:SS string."""
    mins = int(max(0, elapsed_secs)) // 60
    secs = int(max(0, elapsed_secs)) % 60
    return f"{mins:02d}:{secs:02d}"


async def parse_request_params(request: Request) -> dict:
    """Safely extract form/query parameters without requiring python-multipart."""
    params = {}
    for k, v in request.query_params.items():
        params[k] = v

    if request.method == "POST":
        try:
            body_bytes = await request.body()
            if body_bytes:
                body_str = body_bytes.decode("utf-8", errors="ignore")
                parsed = parse_qs(body_str)
                for k, v_list in parsed.items():
                    if v_list:
                        params[k] = v_list[0]
        except Exception:
            pass

    return params


@router.api_route(
    "/voice/{call_id}",
    methods=["GET", "POST"],
    summary="Twilio Voice Webhook: Initiates Assessment Question 1 via <Say> and <Gather input='speech'>",
)
async def twilio_voice_webhook(
    call_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Twilio requests this webhook when the outbound assessment call is answered.
    Initializes the call, records AI Question 1 transcript, and returns standard TwiML with <Gather input='speech'>.
    """
    params = await parse_request_params(request)
    provider_call_id = params.get("CallSid")

    print(
        f"\n========== TWILIO VOICE WEBHOOK ==========\n"
        f"call_id: {call_id}\n"
        f"method: {request.method}\n"
        f"provider_call_id: {provider_call_id or 'N/A'}\n"
        f"==========================================\n",
        flush=True,
    )
    logger.info(f"TWILIO VOICE WEBHOOK HIT: call_id={call_id}, method={request.method}, provider_call_id={provider_call_id}")

    # 1. Load call
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        logger.error(f"Call '{call_id}' not found in PostgreSQL.")
        resp = voice_service.generate_completion_twiml()
        return Response(content=resp, media_type="application/xml")

    # 2. Update status and timestamps
    if provider_call_id and not call.provider_call_id:
        call.provider_call_id = provider_call_id

    if call.status in ("created", "initiating", "ringing"):
        call.status = "in_progress"
    if not call.started_at:
        call.started_at = datetime.now(timezone.utc)
    db.commit()

    # 3. Load 5 questions
    questions = (
        db.query(CallQuestion)
        .filter(CallQuestion.call_id == call_id)
        .order_by(CallQuestion.question_number.asc())
        .all()
    )

    if not questions:
        logger.error(f"No questions found for call '{call_id}'.")
        resp = voice_service.generate_completion_twiml()
        return Response(content=resp, media_type="application/xml")

    q1 = questions[0]

    # 4. Save Question 1 into call_transcripts (if not already recorded)
    existing_q1_transcript = (
        db.query(CallTranscript)
        .filter(
            CallTranscript.call_id == call_id,
            CallTranscript.speaker == "ai",
            CallTranscript.text == q1.question_text,
        )
        .first()
    )
    if not existing_q1_transcript:
        ai_entry = CallTranscript(
            id=f"tr_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            speaker="ai",
            text=q1.question_text,
            timestamp="00:00",
        )
        db.add(ai_entry)
        db.commit()
        print(f"   [AI Turn 1/10] Spoke Question 1: '{q1.question_text}'", flush=True)
        logger.info(f"Recorded AI Turn 1 for call '{call_id}': '{q1.question_text}'")

    # 5. Generate and return Question 1 TwiML with <Gather input="speech">
    twiml_xml = voice_service.generate_question_twiml(call_id, 1, q1.question_text)

    print(
        f"\n========== GENERATED TWIML (QUESTION 1) ==========\n"
        f"{twiml_xml.strip()}\n"
        f"===================================================\n",
        flush=True,
    )

    return Response(content=twiml_xml, media_type="application/xml")


@router.api_route(
    "/voice/{call_id}/respond",
    methods=["GET", "POST"],
    summary="Twilio Speech-to-Text Response Webhook: Ingests SpeechResult, records transcripts, and advances questions",
)
async def twilio_voice_respond_webhook(
    call_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Twilio requests this webhook when the employee speaks in response to a question.
    Ingests SpeechResult, saves employee turn to PostgreSQL, advances to next question (or completes call & runs Gemini analysis).
    """
    params = await parse_request_params(request)

    speech_result = params.get("SpeechResult", "").strip()
    confidence = params.get("Confidence", "N/A")
    call_sid = params.get("CallSid")

    print(
        f"\n========== TWILIO SPEECH RESULT RECEIVED ==========\n"
        f"call_id: {call_id}\n"
        f"CallSid: {call_sid}\n"
        f"Confidence: {confidence}\n"
        f"SpeechResult: '{speech_result}'\n"
        f"===================================================\n",
        flush=True,
    )
    logger.info(f"Speech result for call '{call_id}': '{speech_result}' (Confidence: {confidence})")

    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        logger.error(f"Call '{call_id}' not found.")
        resp = voice_service.generate_completion_twiml()
        return Response(content=resp, media_type="application/xml")

    questions = (
        db.query(CallQuestion)
        .filter(CallQuestion.call_id == call_id)
        .order_by(CallQuestion.question_number.asc())
        .all()
    )

    # Count how many employee responses have already been saved for this call
    emp_answers = (
        db.query(CallTranscript)
        .filter(CallTranscript.call_id == call_id, CallTranscript.speaker == "employee")
        .order_by(CallTranscript.created_at.asc())
        .all()
    )
    answered_count = len(emp_answers)

    # Calculate elapsed call time string
    elapsed_secs = 0.0
    if call.started_at:
        elapsed_secs = (datetime.now(timezone.utc) - call.started_at).total_seconds()
    elapsed_str = format_timestamp(elapsed_secs)

    # Handle empty/missing speech recognition (retry current question)
    if not speech_result:
        curr_q_idx = min(answered_count, len(questions) - 1)
        curr_q = questions[curr_q_idx]
        print(f"   [Retry] Empty speech detected for Question {curr_q.question_number}. Re-prompting employee.", flush=True)
        retry_twiml = voice_service.generate_question_twiml(
            call_id, curr_q.question_number, curr_q.question_text, is_retry=True
        )
        return Response(content=retry_twiml, media_type="application/xml")

    # 1. Save valid employee answer to call_transcripts
    emp_entry = CallTranscript(
        id=f"tr_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        speaker="employee",
        text=speech_result,
        timestamp=elapsed_str,
    )
    db.add(emp_entry)
    db.commit()

    new_answered_count = answered_count + 1
    print(f"   [Employee Turn {new_answered_count}/5] Answered Q{new_answered_count}: '{speech_result}'", flush=True)
    logger.info(f"Saved Employee Answer {new_answered_count}/5 for call '{call_id}': '{speech_result}'")

    # 2. Check if more questions remain
    if new_answered_count < len(questions):
        next_q = questions[new_answered_count]

        # Record next AI question turn
        ai_entry = CallTranscript(
            id=f"tr_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            speaker="ai",
            text=next_q.question_text,
            timestamp=elapsed_str,
        )
        db.add(ai_entry)
        db.commit()
        print(f"   [AI Turn {new_answered_count + 1}/5] Spoke Question {next_q.question_number}: '{next_q.question_text}'", flush=True)
        logger.info(f"Recorded AI Turn {next_q.question_number} for call '{call_id}': '{next_q.question_text}'")

        next_twiml = voice_service.generate_question_twiml(
            call_id, next_q.question_number, next_q.question_text
        )
        return Response(content=next_twiml, media_type="application/xml")

    # 3. All 5 questions answered! Complete assessment
    ended_at = datetime.now(timezone.utc)
    call.status = "completed"
    call.ended_at = ended_at
    if call.started_at:
        call.duration_seconds = max(1, int((ended_at - call.started_at).total_seconds()))
    else:
        call.duration_seconds = 60
    db.commit()

    print(
        f"\n========== ASSESSMENT CALL COMPLETED ==========\n"
        f"call_id: {call_id}\n"
        f"Total Answers: 5/5\n"
        f"Duration: {call.duration_seconds}s\n"
        f"Status: completed\n"
        f"================================================\n",
        flush=True,
    )
    logger.info(f"Assessment call '{call_id}' completed with 5/5 answers. Total duration: {call.duration_seconds}s")

    # 4. Trigger Post-Call Gemini Analysis and Training Generation
    try:
        analysis = analysis_service.analyze_call(db=db, call_id=call_id)
        training_service.generate_modules_for_call(db=db, call_id=call_id, analysis=analysis)
        print(f"   [AI Performance Analysis & Training] Evaluated with Gemini & Generated Training Modules for call '{call_id}'.", flush=True)
        logger.info(f"Gemini evaluation and training generation succeeded for call '{call_id}' (QA Score: {analysis.overall_score})")
    except Exception as e:
        logger.error(f"Post-call analysis generation failed for call '{call_id}': {str(e)}")

    completion_twiml = voice_service.generate_completion_twiml()
    return Response(content=completion_twiml, media_type="application/xml")


@router.api_route(
    "/events/{call_id}",
    methods=["GET", "POST"],
    summary="Twilio Status Callback: updates call lifecycle and duration",
)
async def twilio_status_callback(
    call_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Receives status callback updates from Twilio (e.g. ringing, in-progress, completed, failed).
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        return Response(content="<Response/>", media_type="application/xml")

    params = await parse_request_params(request)

    call_status = params.get("CallStatus", "").lower()
    call_sid = params.get("CallSid")
    duration = params.get("CallDuration")

    logger.info(f"Twilio Event Callback for {call_id}: status={call_status}, sid={call_sid}, duration={duration}")

    if call_sid and not call.provider_call_id:
        call.provider_call_id = call_sid

    if call_status == "initiated":
        if call.status == "created":
            call.status = "initiating"
    elif call_status == "ringing":
        call.status = "ringing"
    elif call_status in ("in-progress", "answered"):
        call.status = "in_progress"
        if not call.started_at:
            call.started_at = datetime.now(timezone.utc)
    elif call_status == "completed":
        if not call.ended_at:
            call.ended_at = datetime.now(timezone.utc)
        if duration and duration.isdigit():
            call.duration_seconds = int(duration)
        emp_count = (
            db.query(CallTranscript)
            .filter(CallTranscript.call_id == call_id, CallTranscript.speaker == "employee")
            .count()
        )
        if emp_count >= 5:
            call.status = "completed"
    elif call_status in ("busy", "no-answer", "canceled", "failed"):
        emp_count = (
            db.query(CallTranscript)
            .filter(CallTranscript.call_id == call_id, CallTranscript.speaker == "employee")
            .count()
        )
        if emp_count < 5:
            call.status = "failed"
        if not call.ended_at:
            call.ended_at = datetime.now(timezone.utc)

    db.commit()
    return Response(content="<Response/>", media_type="application/xml")
