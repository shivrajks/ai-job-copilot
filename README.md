# AI Job Copilot

> Apply smarter. Interview better. Get hired faster.

A production-grade SaaS platform that combines resume intelligence, ATS scoring, AI-powered tailoring, interview coaching, and application tracking into one guided system for job seekers.

## Features

| Module | Description |
|--------|-------------|
| **Resume Intelligence** | Upload PDF/DOCX resumes. Automatic parsing extracts skills, experience, and education. Tika-based content verification prevents malicious uploads. |
| **ATS Score Engine** | Score any resume against a target job. Category breakdowns for keywords, experience fit, education alignment, and formatting quality. Direct fix suggestions. |
| **Job Description Analysis** | Paste a job description and get structured analysis: required skills, experience level, role fit score, and keyword gaps. |
| **AI Resume Tailoring** | Rewrite resume bullets to match a specific job description using Gemini 2.0 Flash. Tuned for ATS optimization while keeping factual accuracy. |
| **Cover Letter Generator** | Generate tailored cover letters from your resume + job description. Multiple tones and templates. Editable before export. |
| **Interview Coach** | Practice with AI-generated questions based on the job you are chasing. Get structure feedback and follow-up prompts. Track progress across sessions. |
| **Application Tracker** | Kanban board + list view. Track status, notes, salary, next actions, and linked AI artifacts per application. Filter, sort, search. |
| **Analytics Dashboard** | Pipeline overview, ATS score trends, interview performance, top matched skills, and recent activity timeline. |

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | LTS runtime — records, sealed classes, pattern matching |
| **Spring Boot 3.3** | Web, Security, Data JPA, Validation, Actuator, Mail |
| **PostgreSQL 16** | Primary database with Flyway migrations (V1–V9) |
| **Redis 7** | Rate limiting, token blacklisting, cache |
| **LangChain4j 1.0.0-beta1** | AI orchestration layer (abstraction over LLM providers) |
| **Gemini 2.0 Flash / 1.5 Pro** | Resume tailoring, JD analysis, cover letter generation, interview coaching |
| **JJWT 0.12.6** | Stateless JWT auth — access (15 min) + refresh (7 days) with rotation |
| **Testcontainers** | Disposable PostgreSQL for integration tests |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15 (App Router)** | React framework with server components, middleware, static generation |
| **TypeScript** | Full type safety across 80+ components |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **Framer Motion** | Page transitions, micro-interactions, scroll animations |
| **React Query** | Server state management, caching, optimistic updates |
| **Zustand** | Lightweight client state management |
| **Recharts** | Analytics charts (pipeline, trends, performance) |
| **Lucide React** | Consistent icon system |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Local development (PostgreSQL + Redis) |
| **AWS** | Production target (ECS, RDS, ElastiCache, S3, CloudFront) |

## Architecture

```
┌──────────────┐     HTTPS/JSON     ┌──────────────┐     JDBC     ┌────────────┐
│   Frontend   │ ──────────────────▶ │   Backend    │ ────────────▶ │ PostgreSQL │
│  Next.js 15  │ ◀────────────────── │ Spring Boot  │ ◀──────────── │   Flyway   │
└──────────────┘     JSON/SSR       └──────┬───────┘               └────────────┘
                                            │
                                       ┌────┴─────┐         ┌──────────────┐
                                       │   Redis   │         │  Gemini AI   │
                                       │  Token /  │         │  LangChain4j │
                                       │  Rate     │         └──────────────┘
                                       └──────────┘
```

### Backend Layers

```
com.aicopilot/
├── config/         SecurityConfig, CORS, rate limiting, app config
├── controller/     11 REST controllers (Auth, Resume, JD, Match, Tailor, etc.)
├── dto/            Request/response DTOs per module
├── entity/         10 JPA entities with UUID primary keys
├── exception/      GlobalExceptionHandler + AppException + ErrorResponse
├── repository/     10 Spring Data JPA repositories + JobSpecification
├── security/       JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
├── service/        15 service classes + file/ storage service
├── match/          SkillSynonymMap, EducationLevel
└── ai/             Abstraction layer (AiService, Gemini*, Mock*, prompt templates, parser)
```

### Frontend Layers

```
src/
├── app/            12 route groups (auth, dashboard, resumes, jobs, tracker, etc.)
├── components/
│   ├── ui/         Primitives (Button, Input, Card, Tabs, Select, Switch, etc.)
│   ├── layout/     DashboardShell, Sidebar, Topbar, PageHeader
│   ├── features/   30+ domain components
│   ├── landing/    Public site (Hero, Features, Pricing, FAQ, etc.)
│   ├── feedback/   Skeleton, EmptyState, ErrorState, LoadingScreen
│   └── navigation/ SiteHeader, Footer
├── lib/api/        12 API client modules
├── lib/animations/ Framer Motion variants
├── store/          12 Zustand stores
├── providers/      AppProviders, ThemeProvider
└── middleware.ts   Route protection (auth redirect)
```

## Screenshots

> *Screenshots to be added. See `docs/PROJECT/07_PORTFOLIO_RELEASE_CHECKLIST.md` for the full capture list.*

| Page | Preview |
|------|---------|
| Landing (hero + features) | — |
| Dashboard | — |
| Resume management | — |
| Job analysis + ATS score | — |
| Application tracker | — |
| Interview coach | — |
| Cover letter generator | — |
| Analytics dashboard | — |

## Sprint History

| Sprint | Focus | Status |
|--------|-------|--------|
| 1B–5D | Foundation, auth, UI system, resume management | ✅ Complete |
| 6E–7F | JD analysis, ATS scoring engine | ✅ Complete |
| 8G | Gemini AI integration | ✅ Complete |
| 9H–10I | Interview coach, application tracker | ✅ Complete |
| 11J | Analytics dashboard | ✅ Complete |
| 12K–13 | Infrastructure, production hardening | ✅ Complete |
| 14–18M | Backend expansion, more test coverage | ✅ Complete |
| 19–20 | Security fixes (path traversal, token rotation, CORS, etc.) | ✅ Complete |
| 21–25H | Premium frontend redesign (glassmorphism, landing page, theme toggle) | ✅ Complete |
| **26** | **Deployment readiness, documentation, portfolio preparation** | **✅ Complete** |

*Detailed changelog: `docs/PROJECT/03_CHANGELOG.md`*

## Security Highlights

| Area | Implementation |
|------|----------------|
| **Authentication** | Stateless JWT with access (15 min) + refresh (7 days, rotation on use) |
| **Password Storage** | BCrypt with strength 12 |
| **Account Lockout** | 5 failed attempts → 15 minute lockout |
| **Rate Limiting** | Auth: 10 req/min. Free tier: 5 req/mo. Pro tier: 10,000 req/mo |
| **No Email Enumeration** | Forgot-password returns identical response whether email exists or not |
| **CORS** | Configurable whitelist, not wildcard |
| **File Upload** | 5 MB limit, PDF/DOCX only, Tika content-type verification |
| **HTTPS** | Enforced in production |
| **Secure Cookies** | HttpOnly, Secure, SameSite in production |

## Testing

| Suite | Command | Status |
|-------|---------|--------|
| Backend unit + integration | `mvn clean test` | 286 tests — 0 failures |
| Frontend type checking | `npm run type-check` | 0 errors |
| Frontend build | `npm run build` | 0 errors, 16 static routes |

Backend tests cover: AuthService, ResumeService, JobDescriptionService, MatchService, TailorValidatorService, RecommendationService, ScoreExplanationService, UserService, InterviewService, ATS scoring, and AI mock provider. Integration tests use Testcontainers with disposable PostgreSQL.

## Quick Start

### Prerequisites

- Java 21 (Eclipse Adoptium / Temurin)
- Node.js 20+
- Maven 3.9+
- Docker Desktop

### 1. Start infrastructure

```bash
cd docker
docker compose up -d
```

### 2. Start backend

```bash
cd backend
# Windows (PowerShell)
$env:JWT_SECRET="dev-jwt-secret-key-ai-copilot-2024-at-least-256-bits-long!!"
mvn clean test   # verify 286 tests pass
mvn spring-boot:run
# API at http://localhost:8080/api
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:3000
```

*Full setup guide: `docs/DEPLOYMENT/02_LOCAL_SETUP_GUIDE.md`*

## Deployment

See the full production deployment guide at `docs/DEPLOYMENT/03_PRODUCTION_SETUP_GUIDE.md`.

**Quick reference:**
1. Build backend JAR: `mvn clean package -DskipTests`
2. Dockerize and push to registry
3. Deploy frontend to Vercel or container
4. Set all environment variables (see `docs/DEPLOYMENT/01_DEPLOYMENT_ENV_GUIDE.md`)
5. Run Flyway migrations: `mvn flyway:migrate`
6. Verify health: `GET /api/actuator/health`

## Future Improvements

- WebSocket-based real-time interview feedback
- GitHub Actions CI/CD pipeline
- Multi-language resume parsing
- OAuth social login (Google, LinkedIn)
- Admin dashboard for user management
- Team/enterprise subscription plans
- Mobile app (React Native or Flutter)

## License

MIT — see [LICENSE](LICENSE) for details.
