-- Phase D: Resume Management
-- Adds parsing status, file metadata, and active flag to resumes table

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS parsing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_resumes_user_active ON resumes(user_id, is_active);
