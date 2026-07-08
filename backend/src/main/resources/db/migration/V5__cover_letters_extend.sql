-- Sprint 9B: Cover Letter Generation
-- Extends cover_letters table with full feature support

ALTER TABLE cover_letters
    ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES resumes(id),
    ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Untitled Cover Letter',
    ADD COLUMN IF NOT EXISTS tone VARCHAR(20) NOT NULL DEFAULT 'professional',
    ADD COLUMN IF NOT EXISTS template VARCHAR(30) NOT NULL DEFAULT 'professional',
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hiring_manager VARCHAR(255),
    ADD COLUMN IF NOT EXISTS recipient_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_active ON cover_letters(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cover_letters_resume ON cover_letters(resume_id);
