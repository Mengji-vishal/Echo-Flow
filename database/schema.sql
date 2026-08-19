-- =============================================================================
-- Echo-Flow PostgreSQL Database Schema
-- Architecture: Separate tables for Managers, Employees, Calls, Questions, Transcripts, Analysis, and Training Modules
-- =============================================================================

-- Table 1: Managers
CREATE TABLE IF NOT EXISTS managers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_managers_email ON managers (LOWER(email));

-- Table 2: Employees
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (LOWER(email));

-- Table 3: Calls
CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(64) PRIMARY KEY,
    manager_id VARCHAR(64) NOT NULL REFERENCES managers(id),
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id),
    status VARCHAR(32) NOT NULL DEFAULT 'created', -- 'created', 'initiating', 'ringing', 'in_progress', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    duration_seconds INTEGER NULL,
    provider_call_id VARCHAR(128) NULL, -- Reserved for future Twilio Call SID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calls_manager_id ON calls (manager_id);
CREATE INDEX IF NOT EXISTS idx_calls_employee_id ON calls (employee_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls (status);

-- Table 4: Call Questions (Exactly 5 questions per call)
CREATE TABLE IF NOT EXISTS call_questions (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    question_number SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 5),
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_call_question_number UNIQUE (call_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_call_questions_call_id ON call_questions (call_id);

-- Table 5: Call Transcripts (Multi-turn dialogue)
CREATE TABLE IF NOT EXISTS call_transcripts (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    speaker VARCHAR(16) NOT NULL CHECK (speaker IN ('ai', 'employee')),
    text TEXT NOT NULL,
    timestamp VARCHAR(16) NOT NULL, -- e.g. "0:12"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts (call_id);

-- Table 6: Call Analysis (1:1 with calls)
CREATE TABLE IF NOT EXISTS call_analysis (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    overall_score SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb, -- empathy, communication, discovery, objectionHandling, solutionOffering, closing, compliance
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT NULL,
    insights JSONB NOT NULL DEFAULT '[]'::jsonb,
    question_evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_call_analysis_call_id ON call_analysis (call_id);

-- Table 7: Training Modules (Generated personalized training curricula)
CREATE TABLE IF NOT EXISTS training_modules (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    source_call_id VARCHAR(64) NULL REFERENCES calls(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skill_area VARCHAR(64) NOT NULL, -- e.g. 'Closing', 'Discovery', 'Objection Handling', 'Compliance', 'Empathy', 'Communication', 'Solution Offering'
    difficulty VARCHAR(32) NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
    estimated_duration VARCHAR(32) NOT NULL DEFAULT '20 mins',
    why_recommended TEXT NULL,
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    progress SMALLINT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_training_modules_employee_id ON training_modules (employee_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_source_call_id ON training_modules (source_call_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_status ON training_modules (status);
CREATE INDEX IF NOT EXISTS idx_training_modules_skill_area ON training_modules (skill_area);
