# Echo-Flow: Complete Setup & Execution Guide

This guide walks you through setting up and running **Echo-Flow** from scratch on any computer (Windows, macOS, or Linux).

---

## 📋 System Requirements & Prerequisites

Before starting, make sure the following are installed:

### 1. Python 3.10, 3.11, or 3.12
- **Download**: [python.org/downloads](https://www.python.org/downloads/)
- ⚠️ **CRITICAL FOR WINDOWS**: During installation, **check the box "Add python.exe to PATH"**!
- Verify in terminal/cmd:
  ```bash
  python --version
  # or on Mac/Linux:
  python3 --version
  ```

### 2. Node.js (v18.x or v20.x LTS)
- **Download**: [nodejs.org](https://nodejs.org/) (Choose the LTS version)
- Verify in terminal/cmd:
  ```bash
  node -v
  npm -v
  ```

### 3. PostgreSQL Database
You can choose **either** Option A (easiest if you have Docker) or Option B (standard installer):
- **Option A (Docker - Recommended)**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Option B (Native Installer)**: Install [PostgreSQL](https://www.postgresql.org/download/). Remember the password you set during installation (e.g. `postgres` or `21061`).

---

## 🗂️ Step 1: Unzip the Project

1. Unzip `echo-flow.zip` into your preferred directory (e.g. `C:\projects\Echo-Flow` or `~/projects/Echo-Flow`).
2. Open your terminal or Command Prompt / PowerShell and navigate into the folder:
   ```bash
   cd Echo-Flow
   ```

---

## ⚙️ Step 2: Configure Environment Variables

The project comes with pre-configured `.env` files. Ensure you have the `.env` file in the root and inside `backend/`:

If `.env` is missing, copy it from `.env.example`:
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  Copy-Item .env.example backend\.env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  cp .env.example backend/.env
  ```

### Key Settings in `.env`:
```ini
PORT=8000
HOST=0.0.0.0
JWT_SECRET=dev-secret-key-change-in-production-echo-flow-2026

# Match this with your local PostgreSQL password:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/echo_flow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=echo_flow
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Twilio & Gemini (Leave as default or add your own keys)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

---

## 🗄️ Step 3: Start PostgreSQL & Create the Database

### Option A: Using Docker (Fastest, 1 Command)
From the project root:
```bash
docker compose up -d
```
*This starts a PostgreSQL 16 container, creates the `echo_flow` database, and runs the schema automatically!*

### Option B: Using Native PostgreSQL (pgAdmin or psql)
1. Open **pgAdmin** or your terminal/cmd.
2. In SQL Shell / `psql` (or pgAdmin query tool), create the database:
   ```sql
   CREATE DATABASE echo_flow;
   ```
*(The backend's SQLAlchemy engine will automatically create all tables and seed default users on its first startup).*

---

## 🐍 Step 4: Setup & Run the Backend (FastAPI)

Open a terminal/cmd window in `Echo-Flow/backend`:

### On macOS / Linux:
```bash
cd backend

# 1. Create a virtual environment
python3 -m venv venv

# 2. Activate virtual environment
source venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the backend server
uvicorn app.main:app --reload --port 8000
```

### On Windows (PowerShell or Command Prompt):
```powershell
cd backend

# 1. Create a virtual environment
python -m venv venv

# 2. Activate virtual environment
# In PowerShell:
.\venv\Scripts\Activate.ps1
# (If you get an execution policy error in PowerShell, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)
# Or in Command Prompt (cmd):
# venv\Scripts\activate.bat

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the backend server
uvicorn app.main:app --reload --port 8000
```

### Verify Backend:
Open your browser to:
- Health check: `http://localhost:8000/health` (should return `{"status":"healthy"}`)
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

---

## ⚛️ Step 5: Setup & Run the Frontend (Next.js)

Open a **second terminal/cmd window** in `Echo-Flow/frontend`:

### On Windows / macOS / Linux:
```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Start the development server
npm run dev
```

### Verify Frontend:
Open your browser to:
- Web Application: **`http://localhost:3000`**

---

## 🔑 Step 6: Log In with Demo Accounts

Echo-Flow automatically seeds two demo accounts on startup:

| Role | Email | Password | Access |
|---|---|---|---|
| **Manager** | `manager@echoflow.com` | `manager123` | Full Manager Analytics & Employee Assessment Portal |
| **Employee** | `employee@echoflow.com` | `employee123` | Employee Training Portal & Quiz Assessment |

---

## 🛠️ Troubleshooting & Common Fixes

1. **Port 8000 or 3000 already in use**:
   - Check if another application or zombie process is using the port.
   - On Windows: `netstat -ano | findstr :8000` followed by `taskkill /PID <PID> /F`.
   - On Mac/Linux: `lsof -i :8000` followed by `kill -9 <PID>`.

2. **Database connection failed (`password authentication failed`)**:
   - Verify your PostgreSQL password in `backend/.env` under `DATABASE_URL` and `POSTGRES_PASSWORD`.
   - Ensure the PostgreSQL service is running.

3. **PowerShell execution policy error on Windows**:
   - Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

4. **Missing Python packages or wheel compile errors**:
   - Ensure you are using Python 3.10, 3.11, or 3.12 (Python 3.13 may have compatibility issues with older wheel binaries).
