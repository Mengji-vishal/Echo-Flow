import logging
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from twilio.twiml.voice_response import VoiceResponse, Connect, ConversationRelay
from app.core.config import settings

logger = logging.getLogger("voice_service")


class VoiceService:
    """
    Twilio Programmable Voice Service Boundary.
    Responsible for initiating outbound assessment calls and generating TwiML.
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
        Initiate an outbound Twilio phone call to the employee's phone number using basic supported parameters.
        Returns the Twilio Call SID (stored in provider_call_id).
        """
        if not settings.TWILIO_PHONE_NUMBER:
            raise ValueError("TWILIO_PHONE_NUMBER is not configured in backend/.env.")

        public_base = settings.PUBLIC_BASE_URL.rstrip("/")
        voice_url = f"{public_base}/twilio/voice/{call_id}"

        clean_to = to_number.strip()
        clean_from = settings.TWILIO_PHONE_NUMBER.strip()

        try:
            # Use minimal standard parameters supported on all Twilio account tiers
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

    def generate_conversation_relay_twiml(self, call_id: str) -> str:
        """
        Generate TwiML response connecting the live call to the FastAPI Conversation Relay WebSocket.
        Dynamically extracts host from configured PUBLIC_BASE_URL and converts https:// to wss://.
        """
        from urllib.parse import urlparse

        raw_url = settings.PUBLIC_BASE_URL.strip()
        if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
            raw_url = f"https://{raw_url}"

        parsed = urlparse(raw_url)
        host = parsed.netloc or parsed.path.strip("/")
        ws_url = f"wss://{host}/twilio/ws/{call_id}"

        response = VoiceResponse()
        connect = Connect()
        relay = ConversationRelay(url=ws_url)
        connect.append(relay)
        response.append(connect)

        return str(response)


voice_service = VoiceService()
