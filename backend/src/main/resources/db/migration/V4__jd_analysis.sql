-- Sprint 6B: Job Description AI Analysis
-- Adds analysis lifecycle tracking and structured data storage

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP;

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS analysis_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS structured_data JSONB;
