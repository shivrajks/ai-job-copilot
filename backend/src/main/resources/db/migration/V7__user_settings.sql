CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(10) NOT NULL DEFAULT 'system',
    default_dashboard_page VARCHAR(50) NOT NULL DEFAULT 'dashboard',
    default_resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    default_sort_field VARCHAR(30) NOT NULL DEFAULT 'createdAt',
    default_sort_direction VARCHAR(10) NOT NULL DEFAULT 'desc',
    notify_password_reset BOOLEAN NOT NULL DEFAULT TRUE,
    notify_resume_parsed BOOLEAN NOT NULL DEFAULT TRUE,
    notify_ats_complete BOOLEAN NOT NULL DEFAULT TRUE,
    notify_interview_ready BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
