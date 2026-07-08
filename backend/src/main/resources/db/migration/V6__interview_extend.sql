-- Sprint 10A: AI Interview Preparation
-- Extends interview_sessions table with full feature support

ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES resumes(id),
    ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Interview Preparation',
    ADD COLUMN IF NOT EXISTS difficulty VARCHAR(10) NOT NULL DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS answered_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_status ON interview_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_resume ON interview_sessions(resume_id);
