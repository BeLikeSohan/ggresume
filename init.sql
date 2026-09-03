-- GGResume Database Schema Initialization
-- Automatically executed on first run of PostgreSQL container

CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
