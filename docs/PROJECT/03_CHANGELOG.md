# Changelog

**Purpose:** Records all notable changes to this project, grouped by sprint/phase.

---

## Sprint 13 — Production Hardening & Documentation Sync (Current)

**Date:** 2026-07-07

### Added
- PROJECT_STATUS.md: Full rebuild reflecting actual Phases A–K implementation
- CHANGELOG.md: Sprint history populated from codebase analysis
- PRODUCT_DECISIONS.md: Architecture and product decisions documented
- Entity ↔ Flyway migration consistency verification report
- Backend test coverage plan

### Changed
- PROJECT_STATUS.md: Updated from stale Phase B state to current A–K reality

---

## Sprint 12B — Authentication (Phase B)

**Date:** 2026-06-23

### Added
- User entity (UUID, email, password, fullName, avatarUrl, googleId, role, planTier, emailVerified, lastLoginAt)
- JwtTokenProvider (HS256, access 15min, refresh 7d)
- JwtAuthenticationFilter (Bearer extraction, validation)
- CustomUserDetailsService (UUID-based user loading)
- SecurityConfig (stateless sessions, CORS, permitAll for auth endpoints)
- AuthController: POST /register, /login, /refresh, /logout, /logout-all, /forgot-password, /reset-password
- AuthService (register, login, refresh w/ rotation, logout, logoutAll, forgotPassword, resetPassword)
- RefreshToken entity + repository (persistence, revocation, expiry)
- PasswordResetToken entity + repository (single-use, 1-hour expiry)
- GlobalExceptionHandler (AppException, validation, JWT, bad credentials)
- ErrorResponse format (status, error, message, details, timestamp, path)
- AuthDtos (RegisterRequest, LoginRequest, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest, AuthResponse)
- BCrypt password encoder (strength 12)
- 17 unit tests for AuthService (6 nested test classes)
- Flyway V1__initial_schema.sql (users, resumes, job_descriptions, applications, interview_sessions, cover_letters, refresh_tokens, password_reset_tokens)

### Security
- No email enumeration on forgot-password
- Refresh token rotation with reuse detection
- Single-use reset tokens with 1-hour expiry
- Email normalization (lowercase + trim)
- CORS whitelist (localhost:3000)

---

## Sprint 11B — Premium UI Foundation (Phase C)

**Date:** 2026-06-20

### Added
- DashboardShell layout (sidebar + topbar + content area)
- Sidebar component (collapsible, navigation links, active states, mobile responsive)
- Topbar component (user menu, theme toggle, search input)
- UserMenu component (avatar, dropdown, logout)
- PageContainer, PageHeader, SectionContainer layout components
- UI primitives: Card, Badge, Tabs, Select, Switch, Progress
- Feedback components: Skeleton (variants), EmptyState, ErrorState, LoadingScreen, InlineLoader
- Framer Motion animation variants (stagger, fade, slide)
- Theme system with next-themes (light/dark/system)
- Design tokens in globals.css
- Responsive breakpoints (375px–1440px)

---

## Sprint 10B — Resume Management (Phase D)

**Date:** 2026-06-17

### Added
- Resume entity (parsing_status, error_message, is_active, file_size, mime_type, parsed_at, parse_attempts)
- ResumeRepository + ResumeService (upload, CRUD, rename, set active, pagination)
- ResumeController (POST /resumes, GET /resumes, GET/PUT/DELETE /resumes/{id}, POST /resumes/{id}/active)
- ResumeDtos (UploadResponse, ResumeListItem, ResumeDetail, RenameRequest)
- FileStorageService interface + LocalFileStorageService (UUID filenames, 5MB limit)
- TikaResumeParser + RuleBasedResumeParser (text extraction, structured data)
- Flyway V2__resume_management.sql (+parsing_status, error_message, is_active, file_size, mime_type)
- Flyway V3__ai_foundation.sql (+parsed_at, parse_attempts)
- Frontend: ResumeList, ResumeUploader, ResumeDetailPanel, ResumeCard, ResumeToolbar
- Frontend: RenameDialog, DeleteDialog, ResumeStructuredView
- Frontend: ResumesPage (list, upload, detail, rename, delete, search, sort)

---

## Sprint 9B — Job Description Analysis (Phase E)

**Date:** 2026-06-14

### Added
- JobDescription entity (analysis_status, analyzed_at, analysis_attempts, error_message, structured_data)
- JobDescriptionRepository + JobDescriptionService
- JobDescriptionController (CRUD + POST /{id}/analyze)
- JobDescriptionDtos (CreateRequest, UpdateRequest, ListItem, Detail, AnalysisResult)
- JobDescriptionAiService + GeminiJobDescriptionAiService + MockJobDescriptionAiService
- JobDescriptionAnalysisPrompts
- Flyway V4__jd_analysis.sql (+analysis_status, analyzed_at, analysis_attempts, error_message, structured_data)
- Frontend: JobsPage with JD management, analysis, search

---

## Sprint 8B — ATS Scoring Engine (Phase F)

**Date:** 2026-06-11

### Added
- MatchService (skill match, experience fit, education fit, keyword alignment, weighted scoring)
- ScoreExplanationService (category breakdown, scoring rationale per category)
- RecommendationService (improvement suggestions, learning resource links, gap analysis)
- TailoringService (resume tailoring analysis, skill gap detection)
- MatchController + TailorController
- SkillSynonymMap (skill normalization, synonym resolution)
- EducationLevel (education level detection and matching)
- MatchDtos, TailorDtos, AtsDtos, ScoreExplanationDtos
- Frontend: MatchResultView, ScoreExplanationCard, Tailor components (skills, experience, education, suggestions)
- Frontend: ATS report view + progress visualization

---

## Sprint 7B — Gemini AI Integration (Phase G)

**Date:** 2026-06-08

### Added
- AiService interface (generic AI service abstraction)
- GeminiAiService (LangChain4j + Gemini API, Flash/Pro model selection)
- MockAiService (deterministic responses for development/testing)
- TailoringAiService + GeminiTailoringAiService + MockTailoringAiService
- CoverLetterAiService + GeminiCoverLetterAiService + MockCoverLetterAiService
- InterviewAiService + GeminiInterviewAiService + MockInterviewAiService
- AiConfig (API key, model selection, timeouts, connection pooling)
- AsyncConfig (thread pool for async AI operations)
- Prompt templates: ResumeTailoring, ResumeParsing, JDAnalysis, Interview, CoverLetter
- AiDtos (ParseRequest/Response, OptimizeRequest/Response, etc.)
- Rate limiting config (free: 5/mo, pro: 10000/mo)
- Flyway V5__cover_letters_extend.sql (+resume_id, title, tone, template, company_name, hiring_manager, recipient_title, is_active)

---

## Sprint 6B — Interview Coach (Phase H)

**Date:** 2026-06-05

### Added
- InterviewSession entity (questions, responses, scores, feedback, tracking fields)
- InterviewRepository + InterviewService (generate, mock start/respond/end, evaluate, history)
- InterviewValidator (input validation for interview operations)
- InterviewController (generate, mock/*, evaluate, sessions CRUD)
- InterviewDtos (QuestionSet, SessionDetail, AnswerEvaluation, SessionHistory)
- Flyway V6__interview_extend.sql (+resume_id, title, difficulty, status, question_count, answered_count, updated_at)
- Frontend: InterviewsPage (list, generate dialog, session, feedback, progress, history)
- Frontend: Dynamic route /interviews/[id]

---

## Sprint 5B — Application Tracker (Phase I)

**Date:** 2026-06-02

### Added
- Application entity + repository (stage pipeline, notes, salary, job URL)
- ApplicationService + ApplicationController (CRUD)
- Job entity + repository + JobSpecification (filtering, sorting, pagination)
- JobService + JobController (CRUD + search)
- ApplicationDtos, JobDtos
- Flyway V8__job_tracker.sql (jobs table with full tracker fields: employment_type, work_mode, skills_required, experience_required, source, priority, is_favorite, is_archived, status, interview_dates, offer_status, rejection_reason, follow_up_date)
- Frontend: TrackerPage (list + kanban views, search, sort, filter)
- Frontend: ApplicationList, ApplicationCard, ApplicationDialog, ApplicationDetailPanel, ApplicationDeleteDialog
- Frontend: KanbanBoard, KanbanToolbar, JobCard, JobDeleteDialog

---

## Sprint 4B — Analytics Dashboard (Phase J)

**Date:** 2026-05-30

### Added
- AnalyticsService (application stats, resume stats, ATS trends, interview performance, weekly activity)
- AnalyticsController (GET /analytics/dashboard)
- AnalyticsDtos (AnalyticsResponse, ApplicationAnalytics, ResumeAnalytics, AtsTrendAnalytics, InterviewPerformanceAnalytics, WeeklyActivityAnalytics)
- Frontend: AnalyticsPage (stat cards, pipeline, top skills, interview performance, ATS overview, recent activity)
- Frontend: Analytics widgets (AnalyticsStatCards, AnalyticsApplicationPipeline, AnalyticsTopSkills, AnalyticsInterviewPerformance, AnalyticsAtsOverview, AnalyticsRecentActivity)

---

## Sprint 3B — Infrastructure (Phase K)

**Date:** 2026-05-27

### Added
- EmailService (password reset email, template rendering)
- Password reset email template (password-reset.html)
- UserSettings entity + repository (theme, defaults, notifications)
- UserController (GET/PUT /user/me, PUT /user/password, GET/PUT /user/settings)
- UserDtos (ProfileResponse, ProfileUpdateRequest, PasswordChangeRequest, SettingsResponse, SettingsUpdateRequest)
- Flyway V7__user_settings.sql (user_settings table with theme, defaults, notification prefs)
- Docker Compose (PostgreSQL 16 + Redis 7)
- GitHub Actions CI/CD workflow
- Actuator endpoints (health, info, metrics)
- application.yml (all external service configs)

---

## Sprint 2B — Foundation Refinements (Phase A)

**Date:** 2026-05-24

### Added
- StartupValidator (validates JWT secret on boot)
- Application-level error handling patterns
- Frontend: middleware.ts (auth redirect logic)
- Frontend: Landing page (hero, features, pricing, footer)
- Frontend: Auth pages (login, register, forgot-password, reset-password)
- Frontend: Dashboard page (stats, quick actions)
- Frontend: AppProviders + ThemeProvider
- Frontend: Zustand auth store
- Frontend: API client module

---

## Sprint 1B — Project Foundation (Phase A)

**Date:** 2026-05-20

### Added
- Monorepo structure (backend/, frontend/, docker/, docs/)
- Spring Boot 3.3.1 + Java 21 + Maven project with pom.xml
- Next.js 15 + React 19 + TypeScript + Tailwind CSS + ShadCN UI
- Docker Compose (PostgreSQL 16 + Redis 7)
- Engineering manual (10 documents in docs/AI_ENGINEERING/)
- Project documentation (7 documents in docs/PROJECT/)
- .gitignore and README.md
- Lombok, JWT, LangChain4j, Tika, Flyway, Testcontainers dependencies
