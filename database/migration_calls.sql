-- =============================================================================
-- Migration: Add Call Data Layer Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(64) PRIMARY KEY,
    manager_id VARCHAR(64) NOT NULL REFERENCES managers(id),
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id),
    status VARCHAR(32) NOT NULL DEFAULT 'created',
    started_at TIMESTAMP WITH TIME ZONE NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    duration_seconds INTEGER NULL,
    provider_call_id VARCHAR(128) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calls_manager_id ON calls (manager_id);
CREATE INDEX IF NOT EXISTS idx_calls_employee_id ON calls (employee_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls (status);

CREATE TABLE IF NOT EXISTS call_questions (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    question_number SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 5),
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_call_question_number UNIQUE (call_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_call_questions_call_id ON call_questions (call_id);

CREATE TABLE IF NOT EXISTS call_transcripts (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    speaker VARCHAR(16) NOT NULL CHECK (speaker IN ('ai', 'employee')),
    text TEXT NOT NULL,
    timestamp VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts (call_id);

CREATE TABLE IF NOT EXISTS call_analysis (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    overall_score SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_call_analysis_call_id ON call_analysis (call_id);
