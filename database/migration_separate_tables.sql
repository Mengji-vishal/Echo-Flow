-- =============================================================================
-- Migration: users table -> managers and employees tables
-- =============================================================================

-- Step 1: Create managers table
CREATE TABLE IF NOT EXISTS managers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_managers_email ON managers (LOWER(email));

-- Step 2: Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (LOWER(email));

-- Step 3: Migrate existing managers from users table
INSERT INTO managers (id, name, email, password_hash, created_at)
SELECT id, name, email, password_hash, created_at
FROM users
WHERE role = 'manager'
ON CONFLICT (email) DO NOTHING;

-- Step 4: Migrate existing employees from users table
INSERT INTO employees (id, name, email, password_hash, created_at)
SELECT id, name, email, password_hash, created_at
FROM users
WHERE role = 'employee'
ON CONFLICT (email) DO NOTHING;
