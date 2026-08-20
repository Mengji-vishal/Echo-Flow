-- =============================================================================
-- Migration: Add phone_number column to employees table
-- =============================================================================

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32) NULL;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_employees_phone_number ON employees (phone_number);
