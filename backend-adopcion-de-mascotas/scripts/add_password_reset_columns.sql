-- Migration: Add password reset columns to usuario table
-- Run: mysql -u root -p adopcion_mascotas < scripts/add_password_reset_columns.sql

ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS password_reset_expires DATETIME DEFAULT NULL;

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON usuario(password_reset_token);
