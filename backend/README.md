# AI Job Copilot — Backend

Spring Boot 3.3 REST API for the AI Job Application Copilot platform.

## Tech Stack

- **Java 21** — Latest LTS with records, sealed classes, pattern matching
- **Spring Boot 3.3** — Web, Security, Data JPA, Validation, Actuator, Mail
- **PostgreSQL 16** — Primary database with Flyway migrations
- **Redis 7** — Session cache, rate limiting, token blacklisting
- **LangChain4j 1.0.0-beta1** — AI orchestration (Gemini 2.0 Flash / 1.5 Pro)
- **JWT (jjwt 0.12.6)** — Stateless authentication (access + refresh tokens)
- **Testcontainers** — Integration tests with disposable PostgreSQL
- **JUnit 5 + Mockito** — 286 passing tests

## Architecture

```
┌──────────────┐     HTTP      ┌──────────────┐     JDBC     ┌────────────┐
│   Frontend   │ ────────────▶ │   Backend    │ ────────────▶ │ PostgreSQL │
│  Next.js 15  │ ◀──────────── │ Spring Boot  │ ◀──────────── │   Flyway   │
└──────────────┘     JSON      └──────┬───────┘               └────────────┘
                                       │
                                  ┌────┴─────┐         ┌──────────────┐
                                  │   Redis   │         │  Gemini AI   │
                                  │  Session  │         │  LangChain4j │
                                  └──────────┘         └──────────────┘
```

## Project Structure

```
src/main/java/com/aicopilot/
├── config/          # Security, CORS, rate limiting, app config
├── controller/      # REST controllers
├── dto/             # Request/response DTOs
├── entity/          # JPA entities
├── exception/       # Global exception handler
├── repository/      # Spring Data JPA repositories
├── security/        # JWT provider, authentication filter, user details
├── service/         # Business logic
└── AiJobCopilotApplication.java

src/main/resources/
├── application.yml              # Main config (all env vars)
├── db/migration/                # Flyway migrations (V1–V9)
└── templates/                   # Email templates
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh JWT (with rotation) |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/logout` | Yes | Revoke refresh token |
| POST | `/api/auth/logout-all` | Yes | Revoke all refresh tokens |
| GET | `/api/resumes` | Yes | List resumes (paginated) |
| POST | `/api/resumes` | Yes | Upload resume (PDF/DOCX) |
| GET | `/api/resumes/{id}` | Yes | Get resume details |
| PUT | `/api/resumes/{id}` | Yes | Rename resume |
| DELETE | `/api/resumes/{id}` | Yes | Delete resume |
| POST | `/api/resumes/{id}/active` | Yes | Set as active resume |
| GET | `/api/job-descriptions` | Yes | List job descriptions (paginated) |
| POST | `/api/job-descriptions` | Yes | Create job description |
| GET | `/api/job-descriptions/{id}` | Yes | Get job description details |
| PUT | `/api/job-descriptions/{id}` | Yes | Update job description |
| DELETE | `/api/job-descriptions/{id}` | Yes | Delete job description |
| POST | `/api/job-descriptions/{id}/tailor` | Yes | Tailor resume to JD |
| POST | `/api/job-descriptions/{id}/match` | Yes | Match resume to JD |
| POST | `/api/job-descriptions/{id}/cover-letter` | Yes | Generate cover letter |
| GET | `/api/job-descriptions/{id}/report` | Yes | Get match report |
| GET | `/api/applications` | Yes | List applications (paginated, filtered) |
| POST | `/api/applications` | Yes | Create application |
| PUT | `/api/applications/{id}` | Yes | Update application |
| DELETE | `/api/applications/{id}` | Yes | Delete application |
| GET | `/api/interviews` | Yes | List interview sessions |
| POST | `/api/interviews` | Yes | Create interview session |
| GET | `/api/interviews/{id}` | Yes | Get interview details |
| POST | `/api/interviews/{id}/answer` | Yes | Submit answer |
| GET | `/api/cover-letters` | Yes | List cover letters |
| POST | `/api/cover-letters` | Yes | Generate cover letter |
| GET | `/api/cover-letters/{id}` | Yes | Get cover letter |
| PUT | `/api/cover-letters/{id}` | Yes | Update cover letter |
| DELETE | `/api/cover-letters/{id}` | Yes | Delete cover letter |
| GET | `/api/user/settings` | Yes | Get user settings |
| PUT | `/api/user/settings` | Yes | Update user settings |
| GET | `/api/analytics/overview` | Yes | Dashboard analytics |
| GET | `/api/analytics/timeline` | Yes | Timeline analytics |

## Security

- **Stateless JWT** — Access tokens (15 min) + refresh tokens (7 days) with rotation
- **Password hashing** — BCrypt strength 12
- **Account lockout** — 5 failed attempts → 15 min lockout
- **Rate limiting** — 10 requests/min on auth endpoints
- **No email enumeration** — Forgot-password returns same response regardless
- **CORS whitelist** — Configurable via `CORS_ALLOWED_ORIGINS`
- **Content-Type** — JSON only, multipart for file uploads
- **File validation** — 5MB max, PDF/DOCX only, Tika content verification

## Database

- **9 Flyway migrations** (V1–V9) covering all entities
- PostgreSQL 16 with Hibernate `validate` mode (schema matches entities)
- Tables: `users`, `resumes`, `job_descriptions`, `applications`, `interview_sessions`, `cover_letters`, `refresh_tokens`, `password_reset_tokens`, `user_settings`, `jobs`

## Commands

```bash
# Run all tests
mvn clean test

# Run tests and package JAR
mvn clean verify

# Run application (requires docker compose for DB + Redis)
mvn spring-boot:run

# Build JAR only
mvn clean package -DskipTests

# Run built JAR
java -jar target/ai-job-copilot-1.0.0-SNAPSHOT.jar
```

## Test Suite

- **286 tests** — All passing (0 failures, 0 errors)
- Service layer: AuthService, JobService, MatchService, RecommendationService, ResumeService, ScoreExplanationService, TailorValidatorService, UserService
- Integration tests with Testcontainers PostgreSQL
- No mocking of AI calls — tests use `mock` provider

## Dependencies

- Java 21 (Eclipse Adoptium / Temurin recommended)
- Maven 3.9+
- Docker Desktop (for local PostgreSQL + Redis)
