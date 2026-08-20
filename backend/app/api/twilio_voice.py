from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Call
from app.services.voice_service import voice_service

router = APIRouter(prefix="/twilio", tags=["Twilio Voice & Webhooks"])


@router.post(
    "/voice/{call_id}",
    summary="Twilio Voice Webhook: returns TwiML to connect call to Conversation Relay",
)
async def twilio_voice_webhook(
    call_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Twilio requests this webhook when the outbound assessment call is answered.
    Returns TwiML that attaches Twilio Voice to our Conversation Relay WebSocket.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call '{call_id}' not found.",
        )

    # If call was still initiating/ringing, transition to in_progress
    if call.status in ("created", "initiating", "ringing"):
        call.status = "in_progress"
        if not call.started_at:
            call.started_at = datetime.now(timezone.utc)
        db.commit()

    twiml_xml = voice_service.generate_conversation_relay_twiml(call_id)
    return Response(content=twiml_xml, media_type="application/xml")


@router.post(
    "/events/{call_id}",
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

    form_data = await request.form()
    call_status = form_data.get("CallStatus", "").lower()
    call_sid = form_data.get("CallSid")
    duration = form_data.get("CallDuration")

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
        call.status = "completed"
        if not call.ended_at:
            call.ended_at = datetime.now(timezone.utc)
        if duration and duration.isdigit():
            call.duration_seconds = int(duration)
    elif call_status in ("busy", "no-answer", "canceled", "failed"):
        call.status = "failed"
        if not call.ended_at:
            call.ended_at = datetime.now(timezone.utc)

    db.commit()
    return Response(content="<Response/>", media_type="application/xml")
