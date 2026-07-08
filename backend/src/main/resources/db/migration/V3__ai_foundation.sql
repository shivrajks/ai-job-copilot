-- Phase E: AI Foundation
-- Adds tracking fields for resume parsing pipeline

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMP;

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS parse_attempts INTEGER NOT NULL DEFAULT 0;
