-- Migration 001: Add password_hash column to users table for JWT authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Set a default bcrypt hash of 'changeme123' for existing seed users
-- $2b$10$... is a valid bcrypt hash for development only
UPDATE users SET password_hash = '$2b$10$rQZ8kHwVLaUQqOuW5Xl2OuJvxPgYh1/BnGKjGpZoAl5Iyh6VqKJGS'
WHERE password_hash IS NULL;
