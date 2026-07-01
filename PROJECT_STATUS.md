# AI Job Application Copilot — Project Status

**Last Updated:** 2026-06-23
**Version:** 1.0.0-SNAPSHOT
**Status:** Phase B — Authentication (Complete)

---

## 1. Completed Features

### Phase A — Project Foundation
- [x] Monorepo structure (backend, frontend, docker, docs)
- [x] Spring Boot 3.3.1 + Java 21 + Maven 3.9.9 backend
- [x] Next.js 15.1 + React 19 + TypeScript + Tailwind CSS frontend
- [x] ShadCN UI component library (Button, Input, Label)
- [x] Docker Compose (PostgreSQL 16 + Redis 7)
- [x] Zustand auth store
- [x] Framer Motion animations
- [x] Glassmorphism design system (light + dark mode CSS variables)
- [x] Landing page (hero, features, pricing, footer)
- [x] Dashboard page (sidebar nav, stats cards, quick actions, activity feed)
- [x] Login page (validation, error handling, Google OAuth placeholder)
- [x] Register page (validation, password strength indicator)
- [x] Forgot Password page (email input, success state)
- [x] Reset Password page (token-based, validation, success state)

### Phase B — Authentication
- [x] User entity (UUID, email, password, fullName, avatarUrl, role, planTier, emailVerified, timestamps)
- [x] Role enum (USER, ADMIN)
- [x] PlanTier enum (FREE, PRO)
- [x] JWT token provider (HS256, access + refresh tokens)
- [x] JWT authentication filter (Bearer token extraction, validation)
- [x] Custom UserDetailsService
- [x] BCrypt password encoder (strength 12)
- [x] Security config (stateless sessions, CORS, permitAll for auth endpoints)
- [x] Register API (`POST /api/auth/register`)
- [x] Login API (`POST /api/auth/login`)
- [x] Token Refresh API (`POST /api/auth/refresh`) with rotation
- [x] Logout API (`POST /api/auth/logout`) — revokes refresh token
- [x] Logout All API (`POST /api/auth/logout-all`) — revokes all user tokens
- [x] Forgot Password API (`POST /api/auth/forgot-password`) — no email enumeration
- [x] Reset Password API (`POST /api/auth/reset-password`) — token validation, revokes all sessions
- [x] RefreshToken entity + repository (token persistence, revocation, expiry)
- [x] PasswordResetToken entity + repository (single-use, 1-hour expiry)
- [x] Global exception handler (AppException, validation, JWT, bad credentials, generic)
- [x] Custom error response format (status, error, message, details, timestamp, path)
- [x] Input validation (server-side annotations + client-side validation)
- [x] Unit tests for AuthService (42 test cases across 6 nested test classes)
- [x] Database migration V1__initial_schema.sql (all tables + indexes)

---

## 2. Pending Features

### Phase C — Premium UI System
**Design Inspiration:** Linear, Stripe, Vercel, Notion
**Requirements:** Premium SaaS appearance, Dark/Light mode, Smooth animations, Glassmorphism, Framer Motion
**Avoid:** Generic admin dashboard, Bootstrap look, Default blue themes

- [ ] Design Tokens (color palette, typography scale, spacing, shadows, border radius)
- [ ] Theme System (dark mode, light mode, theme toggle, localStorage persistence)
- [ ] Navbar Component (glassmorphism, sticky, user menu, notifications, search)
- [ ] Sidebar Component (collapsible, nested nav, active states, mobile responsive)
- [ ] Layout Component (sidebar + navbar + content area, responsive breakpoints)
- [ ] Dashboard Page (premium redesign with animated stats, charts, activity feed)
- [ ] Landing Page (premium redesign with animations, gradient mesh, micro-interactions)
- [ ] Auth Pages (premium redesign — login, register, forgot/reset password)
- [ ] Loading States (skeleton loaders, shimmer effects, spinner components)
- [ ] Toast Notifications (success, error, warning, info with animations)
- [ ] Modal/Dialog System (frosted overlay, scale animation, focus trap)
- [ ] Card Components (glass cards, stat cards, interactive hover cards)
- [ ] Form Components (textarea, select, checkbox, toggle, file upload dropzone)
- [ ] Data Table Component (sorting, filtering, pagination, row actions)
- [ ] Tooltip & Popover Components
- [ ] Avatar Component (image, fallback initials, status indicator)
- [ ] Badge/Tag Components (status badges, skill tags, pipeline stage badges)
- [ ] Progress Bar & Score Ring Components (animated, color-coded)
- [ ] Tab Component (animated indicator, keyboard navigation)
- [ ] Command Palette (Cmd+K search, keyboard shortcuts, Linear-style)

### Phase D — Resume Management
**Requirements:** PDF only, Validation, Secure uploads, Error handling

- [ ] Resume Upload API (`POST /api/resumes/upload`)
  - PDF file validation (magic bytes, not just extension)
  - 5MB file size limit
  - Virus scan integration point
  - S3-compatible storage (local dev: filesystem)
  - UUID-based file naming (never store original filename)
- [ ] Resume PDF Parsing Service
  - Apache Tika integration for text extraction
  - Structured data extraction (name, email, phone, summary, experience, education, skills)
  - Confidence scoring per extracted field
  - Fallback error handling for corrupted PDFs
- [ ] Resume Storage Service
  - Store parsed content as JSONB in database
  - Link to file storage URL
  - Version management (user can have multiple versions)
- [ ] Resume Metadata Management
  - Resume name, upload date, file size, parsing status
  - Active/inactive resume flag
  - Resume CRUD APIs (GET, PUT, DELETE)
- [ ] Resume DTOs (ResumeUploadResponse, ResumeMetadata, ResumeDetail)
- [ ] Resume Service (business logic layer)
- [ ] Resume Controller (REST endpoints)
- [ ] Frontend: Upload Resume Screen
  - Drag-and-drop upload zone
  - File type/size validation
  - Upload progress indicator
  - Success/error feedback
  - Preview of uploaded resume
- [ ] Frontend: Resume Management Dashboard
  - List of user's resumes with metadata
  - Resume cards with name, date, status
  - Actions: view, rename, delete, set active
  - Empty state with upload CTA
  - Resume detail view with parsed content preview

### Phase E — Job Description Analysis
**Features:** Paste JD, Upload JD, Extract Skills, Extract Keywords

- [ ] JD Input Service
  - Accept raw text paste (up to 10,000 characters)
  - URL fetching with HTML stripping (LinkedIn, Indeed, Glassdoor, company pages)
  - PDF/DOCX upload for JD documents
  - Auto-detection and cleaning of HTML tags
- [ ] JD Parsing & Analysis Service
  - Extract required skills vs preferred skills
  - Extract keywords with frequency and importance ranking
  - Detect seniority level from JD text
  - Detect company culture signals
  - Salary range extraction (if mentioned)
  - Red flag detection patterns
- [ ] Skill Extraction Engine
  - Map to standardized skill taxonomy (ESCO/O*NET based)
  - Normalize skill names ("React.js" → "React")
  - Categorize: Technical, Soft Skills, Tools, Frameworks, Certifications
- [ ] Keyword Analysis Engine
  - TF-IDF scoring
  - Contextual importance via Gemini
  - Keyword density recommendations
  - Group by category
- [ ] JD Entity + Repository (company, title, rawText, extractedSkills, url)
- [ ] JD DTOs (JDCreateRequest, JDAnalysisResponse, SkillMatchResult)
- [ ] JD Controller (POST /api/jobs, GET /api/jobs, GET /api/jobs/{id})
- [ ] Frontend: Analysis Screen
  - Text paste area with character count
  - URL input with fetch button
  - File upload option
  - Analyze button with loading state
- [ ] Frontend: Results Screen
  - Extracted skills categorized display
  - Keyword cloud with importance indicators
  - Seniority level badge
  - Red flags warning section
  - Save to tracker CTA

### Phase F — ATS Scoring Engine
**Features:** Resume Score, JD Match Percentage, Missing Skills, Improvement Suggestions

- [ ] ATS Scoring Service
  - Section heading detection (Experience, Education, Skills, Summary)
  - Keyword density analysis
  - Formatting complexity check (tables, columns, images)
  - Contact info presence validation
  - Date format consistency check
  - File structure analysis
  - Score calculation (0-100) with category breakdown
- [ ] JD Match Service
  - Skills match (exact + semantic via pgvector)
  - Experience level fit analysis
  - Education fit analysis
  - Keyword alignment scoring
  - Weighted overall match percentage
- [ ] Gap Analysis Service
  - Compare resume skills vs JD requirements
  - Categorize gaps: Critical, Important, Nice-to-have
  - Suggest learning resources for top missing skills
  - Market demand data for missing skills
- [ ] Improvement Suggestions Engine
  - Specific actionable suggestions
  - "Missing skills section" type warnings
  - Keyword injection recommendations
  - Bullet point improvement tips
- [ ] Analytics APIs
  - GET /api/ats/score/{resumeId}
  - GET /api/ats/match/{resumeId}/{jdId}
  - GET /api/ats/gaps/{resumeId}/{jdId}
  - GET /api/ats/suggestions/{resumeId}
- [ ] ATS DTOs (ScoreResponse, MatchResponse, GapResponse, SuggestionResponse)
- [ ] Frontend: ATS Score Display
  - Animated score ring (circular progress)
  - Category breakdown bars
  - Color-coded: green/amber/orange/red
  - Detailed issue list with fix suggestions
- [ ] Frontend: Match Results Display
  - Overall match percentage ring
  - Skills comparison (matched/partial/missing)
  - Keyword presence/absence list
  - Gap analysis visualization

### Phase G — Gemini AI Integration
**Features:** Resume Optimization, Cover Letter Generator, Skill Gap Analysis, Career Suggestions
**Requirements:** Service Abstraction Layer, Prompt Templates, Retry Logic, Rate Limiting, Logging, Error Handling

- [ ] Gemini API Configuration
  - API key from environment variable
  - Model selection: Flash (fast/cheap) vs Pro (deep reasoning)
  - Base URL and timeout configuration
  - Connection pooling
- [ ] AI Service Abstraction Layer
  - Generic `AiService` interface
  - `GeminiAiService` implementation
  - Request/Response logging
  - Token usage tracking
  - Cost estimation per request
- [ ] Prompt Template System
  - Resume optimization prompt
  - Cover letter generation prompt
  - Skill gap analysis prompt
  - Career suggestion prompt
  - Interview question generation prompt
  - Answer evaluation prompt
  - Template versioning
- [ ] Retry Logic
  - Exponential backoff (3 attempts)
  - Transient error detection (rate limits, timeouts)
  - Circuit breaker pattern for persistent failures
  - Fallback responses
- [ ] Rate Limiting
  - Redis-based sliding window per user
  - Free tier: 5 requests/month
  - Pro tier: unlimited
  - Usage tracking and quota enforcement
  - Rate limit headers in responses
- [ ] Resume Optimization Service (Gemini Flash)
  - Input: resume content + JD text
  - Output: optimized resume JSON with changes explained
  - Keyword injection suggestions
  - Bullet point rewrites (STAR method)
  - Skills reordering by relevance
  - Summary rewrite
- [ ] Cover Letter Generator Service (Gemini Flash)
  - Input: resume + JD + company info + tone preference
  - Output: 250-400 word cover letter
  - Tone options: Professional, Enthusiastic, Concise, Creative
  - Structure: Hook → Why company → Why you → Call to action
  - Regenerate capability
- [ ] Skill Gap Analysis Service (Gemini Pro)
  - Input: resume skills + JD requirements
  - Output: prioritized gap list with learning paths
  - Resource suggestions (courses, docs, tutorials)
  - Time estimates for skill acquisition
- [ ] Career Suggestion Service (Gemini Pro)
  - Input: resume + career goals
  - Output: role recommendations, industry suggestions
  - Salary range estimates
  - Career path mapping
- [ ] AI Usage Tracking Entity + Repository
  - Track every AI request per user
  - Feature type, tokens used, cost, timestamp
  - Monthly aggregation for quota enforcement
- [ ] AI Controller Endpoints
  - POST /api/ai/optimize-resume
  - POST /api/ai/generate-cover-letter
  - POST /api/ai/skill-gap-analysis
  - POST /api/ai/career-suggestions
  - GET /api/ai/usage (current period usage)
- [ ] AI DTOs (OptimizeRequest, CoverLetterRequest, GapAnalysisResponse, etc.)
- [ ] Frontend: AI Chat Interface
  - Streaming response display
  - Markdown rendering
  - Copy to clipboard
  - Regenerate button
  - Usage quota display

### Phase H — AI Interview Coach
**Features:** Generate Questions, Behavioral Questions, Technical Questions, Answer Evaluation, AI Feedback

- [ ] Interview Question Generation Service
  - Input: JD + resume
  - Generate 15-20 questions per session
  - Categories: Technical (40%), Behavioral (30%), System Design (15%), Culture Fit (15%)
  - Difficulty calibration based on seniority
  - Questions ranked by likelihood
  - Include: context why asked, what interviewer looks for, sample answer framework
- [ ] Behavioral Question Engine
  - Target JD-mentioned competencies
  - STAR framework template per question
  - Suggest which resume experiences to reference
  - Common follow-up questions
  - Difficulty rating (Easy/Medium/Hard)
- [ ] Technical Question Engine
  - Generate questions for each technology in JD
  - Types: conceptual, coding scenarios, troubleshooting, architecture decisions
  - Difficulty matched to role seniority
  - Model answers and evaluation rubrics
  - Links to relevant documentation
- [ ] Mock Interview Simulator (Gemini Pro)
  - Conversational AI interviewer
  - Context-aware follow-up questions
  - Real-time text-based interaction
  - Session management (start, continue, end)
  - Transcript recording
- [ ] Answer Evaluation Service (Gemini Pro)
  - Evaluate on: relevance (0-10), STAR compliance (0-10), confidence (0-10), completeness (0-10)
  - Specific improvement suggestions per dimension
  - Highlight strong points to reinforce
  - Suggest additional points to include
  - Track improvement over multiple sessions
- [ ] Interview Session Entity + Repository
  - Session type, questions, responses, scores, feedback
  - User linking, timestamps
  - Session history with scores and transcripts
- [ ] Interview Controller Endpoints
  - POST /api/interview/generate-questions
  - POST /api/interview/mock/start
  - POST /api/interview/mock/respond
  - POST /api/interview/mock/end
  - POST /api/interview/evaluate-answer
  - GET /api/interview/sessions
  - GET /api/interview/sessions/{id}
- [ ] Interview DTOs (QuestionSet, MockSession, AnswerEvaluation, SessionHistory)
- [ ] Frontend: Question Generation Screen
  - Category tabs (All, Technical, Behavioral, System Design, Culture Fit)
  - Question cards with likelihood bar, difficulty badge
  - STAR framework expandable section
  - "Practice this question" button
  - Save to question bank
- [ ] Frontend: Mock Interview Screen
  - AI interviewer message bubble
  - User text input area
  - Word count and progress bar
  - Skip / Get Feedback / End Session buttons
  - Real-time typing indicator
- [ ] Frontend: Feedback Screen
  - Overall score with animated ring
  - Per-dimension score bars
  - Improvement suggestions list
  - Try Again / Next Question / View Session buttons
- [ ] Frontend: Interview History Screen
  - List of past sessions with scores
  - Filter by date, type, score
  - Session detail view with full transcript
  - Progress trend chart

### Phase I — Application Tracker
- [ ] Application CRUD APIs
- [ ] Kanban pipeline (drag-and-drop)
- [ ] Stage management with timestamps
- [ ] Interview scheduling
- [ ] Follow-up reminders
- [ ] Tracker APIs and frontend page

### Phase J — Analytics Dashboard
- [ ] Response rate metrics
- [ ] Pipeline funnel visualization
- [ ] Applications per week trends
- [ ] Best performing resume analysis
- [ ] AI usage tracking
- [ ] Analytics APIs and frontend page

### Phase K — Infrastructure & DevOps
- [ ] Google OAuth 2.0 integration
- [ ] Email service (password reset, verification)
- [ ] AWS S3 file storage
- [ ] pgvector setup for semantic search
- [ ] GitHub Actions CI/CD pipeline
- [ ] AWS ECS Fargate deployment
- [ ] Rate limiting (Redis-based)
- [ ] Integration tests (Testcontainers)
- [ ] E2E tests (Playwright)
- [ ] Postman collection

---

## 3. Current Architecture

### Backend Architecture (Spring Boot 3 Layers)

```
com.aicopilot/
├── AiCopilotApplication.java          # Main entry point
├── config/
│   └── SecurityConfig.java            # Spring Security, JWT, CORS, BCrypt
├── controller/
│   └── AuthController.java            # 7 auth endpoints
├── dto/
│   └── AuthDtos.java                  # Request/Response DTOs (Register, Login,
│                                      #   ForgotPassword, ResetPassword,
│                                      #   RefreshToken, Logout, AuthResponse)
├── entity/
│   ├── User.java                      # id, email, password, fullName, role, planTier
│   ├── Resume.java                    # id, user, name, content, atsScore, version
│   ├── JobDescription.java            # id, user, title, company, rawText, skills
│   ├── Application.java               # id, user, resume, jd, company, role, stage
│   ├── RefreshToken.java              # id, user, token, expiryDate, revoked
│   └── PasswordResetToken.java        # id, user, token, expiryDate, used
├── exception/
│   ├── AppException.java              # Custom exception with HttpStatus
│   ├── ErrorResponse.java             # Standard error response format
│   └── GlobalExceptionHandler.java    # @RestControllerAdvice (7 exception handlers)
├── repository/
│   ├── UserRepository.java            # findByEmail, existsByEmail
│   ├── ResumeRepository.java          # findByUserIdOrderByCreatedAtDesc
│   ├── JobDescriptionRepository.java  # findByUserIdOrderByCreatedAtDesc
│   ├── ApplicationRepository.java    # findByUserId, countByUserIdAndStageIn
│   ├── RefreshTokenRepository.java    # findByToken, deleteByUser, revokeAllByUser
│   └── PasswordResetTokenRepository.java # findByToken, deleteByUser
├── security/
│   ├── JwtTokenProvider.java          # HS256, access (15min) + refresh (7d)
│   ├── JwtAuthenticationFilter.java   # OncePerRequestFilter, Bearer extraction
│   └── CustomUserDetailsService.java  # Loads user by UUID from repository
└── service/
    └── AuthService.java               # register, login, refresh, logout,
                                       #   logoutAll, forgotPassword, resetPassword
```

### Frontend Architecture (Next.js 15 App Router)

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (Inter font, globals)
│   ├── globals.css                    # Tailwind + CSS variables (light/dark)
│   ├── page.tsx                       # Landing page (hero, features, pricing)
│   ├── auth/
│   │   ├── login/page.tsx             # Login form with validation
│   │   ├── register/page.tsx          # Register form + password strength
│   │   ├── forgot-password/page.tsx   # Email input + success state
│   │   └── reset-password/page.tsx    # New password + token validation
│   └── dashboard/
│       └── page.tsx                   # Sidebar + stats + quick actions
├── components/ui/
│   ├── button.tsx                     # ShadCN Button (4 variants, 4 sizes)
│   ├── input.tsx                      # ShadCN Input
│   └── label.tsx                      # ShadCN Label
├── lib/
│   └── utils.ts                       # cn() utility (clsx + tailwind-merge)
└── store/
    └── auth.ts                        # Zustand auth store (token, user, setAuth, clearAuth)
```

### Authentication Flow

```
Register -> POST /api/auth/register -> BCrypt hash -> JWT pair -> 201
Login    -> POST /api/auth/login    -> BCrypt verify -> JWT pair -> 200
Refresh  -> POST /api/auth/refresh  -> Validate old -> Revoke old -> New pair -> 200
Logout   -> POST /api/auth/logout   -> Revoke refresh token -> 200
LogoutAll-> POST /api/auth/logout-all -> Revoke ALL user tokens -> 200
Forgot   -> POST /api/auth/forgot-password -> UUID token (1h) -> Generic message -> 200
Reset    -> POST /api/auth/reset-password -> Validate token -> BCrypt new -> Revoke all -> 200
```

---

## 4. Current Database Schema

### Tables (PostgreSQL 16)

**users**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt hash) |
| full_name | VARCHAR(255) | NOT NULL |
| avatar_url | VARCHAR(500) | |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'USER' |
| email_verified | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**resumes**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, CASCADE |
| name | VARCHAR(255) | NOT NULL |
| content | TEXT | |
| structured_data | JSONB | |
| ats_score | INTEGER | |
| file_url | VARCHAR(500) | |
| version | INTEGER | DEFAULT 1 |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**job_descriptions**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, CASCADE |
| company | VARCHAR(255) | |
| title | VARCHAR(255) | NOT NULL |
| raw_text | TEXT | |
| requirements | TEXT | |
| extracted_skills | JSONB | |
| url | VARCHAR(500) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**applications**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, CASCADE |
| resume_id | UUID | FK -> resumes.id |
| job_description_id | UUID | FK -> job_descriptions.id |
| company | VARCHAR(255) | NOT NULL |
| role_title | VARCHAR(255) | NOT NULL |
| location | VARCHAR(255) | |
| job_url | VARCHAR(500) | |
| status | VARCHAR(30) | DEFAULT 'SAVED' |
| applied_date | DATE | |
| notes | TEXT | |
| salary_min | INTEGER | |
| salary_max | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**refresh_tokens**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, CASCADE |
| token | VARCHAR(500) | UNIQUE, NOT NULL |
| expiry_date | TIMESTAMP | NOT NULL |
| revoked | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | |

**password_reset_tokens**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, CASCADE |
| token | VARCHAR(255) | UNIQUE, NOT NULL |
| expiry_date | TIMESTAMP | NOT NULL |
| used | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | |

**interview_sessions** — created, not yet used
**cover_letters** — created, not yet used

### Indexes
- `idx_users_email` on users(email)
- `idx_resumes_user_id` on resumes(user_id)
- `idx_resumes_user_active` on resumes(user_id, is_active)
- `idx_jd_user_id` on job_descriptions(user_id)
- `idx_applications_user_id` on applications(user_id)
- `idx_applications_status` on applications(status)
- `idx_applications_user_status` on applications(user_id, status)
- `idx_refresh_tokens_user` on refresh_tokens(user_id)
- `idx_refresh_tokens_token` on refresh_tokens(token)
- `idx_interview_sessions_user` on interview_sessions(user_id)
- `idx_cover_letters_user` on cover_letters(user_id)

---

## 5. Current Implementation Status

### Build Status

| Component | Command | Status |
|---|---|---|
| Backend compile | `mvn compile` | PASS (21 source files) |
| Backend package | `mvn package -DskipTests` | PASS (fat JAR) |
| Frontend type-check | `tsc --noEmit` | PASS (0 errors) |
| Frontend build | `npm run build` | PASS (7 routes) |

### API Endpoints (7 total)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account, return JWT pair |
| POST | /api/auth/login | Public | Verify credentials, return JWT pair |
| POST | /api/auth/refresh | Public | Rotate refresh token, return new JWT pair |
| POST | /api/auth/logout | Public | Revoke specific refresh token |
| POST | /api/auth/logout-all | Authenticated | Revoke all user refresh tokens |
| POST | /api/auth/forgot-password | Public | Create reset token (no enumeration) |
| POST | /api/auth/reset-password | Public | Validate token, set new password |

### Frontend Routes (7 total)

| Route | Page | Features |
|---|---|---|
| / | Landing page | Hero, features grid, pricing cards, footer |
| /auth/login | Login | Email/password validation, error display, Google OAuth placeholder |
| /auth/register | Register | Full validation, password strength indicator, confirm password |
| /auth/forgot-password | Forgot Password | Email input, success state, no enumeration |
| /auth/reset-password | Reset Password | Token from URL, new password + confirm, strength indicator |
| /dashboard | Dashboard | Sidebar nav, stat cards, quick actions, activity feed |

### Test Coverage

| Test Class | Tests | Coverage |
|---|---|---|
| AuthServiceTest.Register | 2 | New user, duplicate email |
| AuthServiceTest.Login | 4 | Valid, invalid email, wrong password, lastLogin update |
| AuthServiceTest.RefreshToken | 3 | Success, invalid, expired |
| AuthServiceTest.Logout | 2 | Known token, unknown token |
| AuthServiceTest.ForgotPassword | 2 | Existing email, non-existing email |
| AuthServiceTest.ResetPassword | 4 | Success, invalid token, used token, expired token |
| **Total** | **17 test methods** | **AuthService fully covered** |

### Security Measures Implemented

- BCrypt password hashing (strength 12)
- JWT with short-lived access tokens (15 min) + refresh tokens (7 days)
- Refresh token rotation (old revoked on each use)
- Refresh token reuse detection (triggers session revocation)
- No email enumeration on forgot password
- Single-use password reset tokens with 1-hour expiry
- Input validation on both client and server
- Global exception handler (no stack traces leaked)
- CORS whitelist (localhost:3000)
- Stateless session management (no server-side sessions)
- Email normalization (lowercase + trim)

### Environment

| Tool | Version | Path |
|---|---|---|
| Java | 21.0.11 (Temurin) | C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot |
| Maven | 3.9.9 | C:\Users\Shadow\Tools\apache-maven-3.9.9 |
| Node.js | 22.23.0 | Hermes bundled |
| npm | 10.9.8 | Hermes bundled |
| PostgreSQL | 16 (Docker) | docker-compose.yml |
| Redis | 7 (Docker) | docker-compose.yml |

---

## 6. Next Steps

1. **Phase C**: Premium UI System (design tokens, theme system, navbar, sidebar, layout, 20+ components)
2. **Phase D**: Resume Management (upload, PDF parsing, storage, CRUD, frontend screens)
3. **Phase E**: Job Description Analysis (paste/upload JD, skill extraction, keyword analysis)
4. **Phase F**: ATS Scoring Engine (resume score, JD match, gap analysis, suggestions)
5. **Phase G**: Gemini AI Integration (resume optimizer, cover letter generator, skill gap, career suggestions)
6. **Phase H**: AI Interview Coach (question generation, mock interviews, answer evaluation, feedback)
7. **Phase I**: Application Tracker (Kanban pipeline, stage management, scheduling)
8. **Phase J**: Analytics Dashboard (response rates, funnel, trends, AI usage)
9. **Phase K**: Infrastructure & DevOps (Google OAuth, email, AWS, CI/CD, tests)
