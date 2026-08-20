import logging
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from twilio.twiml.voice_response import VoiceResponse, Gather, Say, Hangup, Redirect
from app.core.config import settings

logger = logging.getLogger("voice_service")


class VoiceService:
    """
    Twilio Programmable Voice Service Boundary.
    Responsible for initiating outbound assessment calls and generating standard Programmable Voice TwiML.
    """

    def __init__(self):
        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        if not self._client:
            if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
                raise ValueError("Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not configured.")
            self._client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        return self._client

    def initiate_outbound_call(self, call_id: str, to_number: str) -> str:
        """
        Initiate an outbound Twilio phone call to the employee's phone number.
        Returns the Twilio Call SID (stored in provider_call_id).
        """
        if not settings.TWILIO_PHONE_NUMBER:
            raise ValueError("TWILIO_PHONE_NUMBER is not configured in backend/.env.")

        public_base = settings.PUBLIC_BASE_URL.rstrip("/")
        voice_url = f"{public_base}/twilio/voice/{call_id}"

        clean_to = to_number.strip()
        clean_from = settings.TWILIO_PHONE_NUMBER.strip()

        try:
            twilio_call = self.client.calls.create(
                to=clean_to,
                from_=clean_from,
                url=voice_url,
            )
            return twilio_call.sid
        except TwilioRestException as e:
            logger.error(f"Twilio REST Error initiating call {call_id}: code={e.code}, msg={e.msg}")
            raise ValueError(f"Twilio call initiation failed: {e.msg}")
        except Exception as e:
            logger.error(f"Unexpected error initiating call {call_id}: {str(e)}")
            raise ValueError(f"Voice service failed to initiate outbound call: {str(e)}")

    def generate_question_twiml(
        self,
        call_id: str,
        question_number: int,
        question_text: str,
        is_retry: bool = False,
    ) -> str:
        """
        Generate TwiML using <Gather input="speech"> and <Say> to speak a question
        and capture the employee's voice answer.
        """
        public_base = settings.PUBLIC_BASE_URL.rstrip("/")
        action_url = f"{public_base}/twilio/voice/{call_id}/respond"

        if is_retry:
            speech_prompt = f"I didn't catch that. Please answer again. Question {question_number}: {question_text}"
        elif question_number == 1:
            speech_prompt = f"Hello. This is your Echo-Flow assessment. Question 1: {question_text}"
        else:
            speech_prompt = f"Thank you. Question {question_number}: {question_text}"

        response = VoiceResponse()
        gather = Gather(
            input="speech",
            action=action_url,
            method="POST",
            speech_timeout="auto",
        )
        gather.say(speech_prompt)
        response.append(gather)
        # Fallback redirect if user remained silent
        response.redirect(action_url, method="POST")

        return str(response)

    def generate_completion_twiml(self) -> str:
        """
        Generate closing TwiML terminating the completed assessment call cleanly.
        """
        response = VoiceResponse()
        response.say("Thank you. Your assessment is complete.")
        response.hangup()
        return str(response)


voice_service = VoiceService()
