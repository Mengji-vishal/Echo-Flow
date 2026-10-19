# Echo-Flow

Echo-Flow is an AI Assessment & Training Platform featuring real-time call simulation, automated transcript analysis, personalized employee training modules, and manager dashboards.

## Architecture

- **Backend**: FastAPI (Python 3.10+), SQLAlchemy 2.0, PostgreSQL, Uvicorn, Google Gemini AI, Twilio Voice
- **Frontend**: Next.js 14 (React 18), TypeScript, Tailwind CSS, Lucide Icons
- **Database**: PostgreSQL with separated manager, employee, call, transcript, and training module schemas

## Quick Start & Setup on a New Laptop

Please follow the complete step-by-step setup guide in:
➡️ **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Quick Commands Summary

1. **Database**:
   ```bash
   docker compose up -d
   ```
2. **Backend**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Default Demo Credentials
- **Manager Portal**: `manager@echoflow.com` / `manager123`
- **Employee Portal**: `employee@echoflow.com` / `employee123`
