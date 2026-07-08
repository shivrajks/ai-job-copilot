CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    employment_type VARCHAR(20),
    work_mode VARCHAR(10),
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    skills_required JSONB,
    experience_required VARCHAR(100),
    source VARCHAR(20),
    source_url VARCHAR(2048),
    notes TEXT,
    date_saved DATE,
    deadline DATE,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'SAVED',
    applied_date DATE,
    interview_dates JSONB,
    offer_status VARCHAR(20),
    rejection_reason TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_is_favorite ON jobs(is_favorite);
CREATE INDEX IF NOT EXISTS idx_jobs_is_archived ON jobs(is_archived);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
