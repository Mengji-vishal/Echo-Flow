-- =============================================================================
-- Migration: Add Training Modules and Enhance Call Analysis
-- =============================================================================

-- 1. Enhance call_analysis table with insights and question evaluations
ALTER TABLE call_analysis 
ADD COLUMN IF NOT EXISTS insights JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE call_analysis 
ADD COLUMN IF NOT EXISTS question_evaluations JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Create Training Modules Table
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
