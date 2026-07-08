# Deployment Environment Variable Guide

## Overview

The application uses environment variables for all configuration. No secrets are hard-coded. This guide documents every variable, its purpose, and production requirements.

## Backend Variables

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | `localhost` | PostgreSQL hostname |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `aicopilot` | Database name |
| `DB_USERNAME` | Yes | `aicopilot` | Database user |
| `DB_PASSWORD` | Yes | `aicopilot` | Database password |

**Production:** Use a managed PostgreSQL instance (RDS, Cloud SQL, etc.) with strong password (32+ chars). Never use defaults.

### Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | Yes | `localhost` | Redis hostname |
| `REDIS_PORT` | Yes | `6379` | Redis port |
| `REDIS_PASSWORD` | No | (empty) | Redis password |

**Production:** Enable Redis AUTH with a strong password. Use TLS if available.

### JWT

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | — | HMAC-SHA256 signing key (min 256 bits / 32 bytes base64) |

**Security requirements:**
- Minimum 256 bits (43 chars base64 or 32 bytes raw)
- Generate with: `openssl rand -base64 32`
- Rotate periodically (every 90 days recommended)
- Never commit to version control
- Use a secrets manager in production (AWS Secrets Manager, GCP Secret Manager, etc.)

### AI / Gemini

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `mock` | AI backend: `gemini` or `mock` |
| `GEMINI_API_KEY` | For Gemini | (empty) | Google Gemini API key |

**Production:** Set `AI_PROVIDER=gemini` and provide a valid Gemini API key. The `mock` provider returns canned responses for development/testing.

### SMTP / Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | For email | (empty) | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port (587 STARTTLS, 465 SSL) |
| `SMTP_USERNAME` | For email | (empty) | SMTP auth username |
| `SMTP_PASSWORD` | For email | (empty) | SMTP auth password |
| `SMTP_AUTH` | No | `true` | Enable SMTP authentication |
| `SMTP_STARTTLS` | No | `true` | Enable STARTTLS |

**Production:** Use a transactional email service (SendGrid, Amazon SES, Mailgun, etc.). Store credentials in a secrets manager.

### CORS

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | Comma-separated allowed origins |

**Production:** Set to your frontend domain(s) only. Example: `https://app.yourdomain.com`

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_BASE_URL` | Yes | `http://localhost:3000` | Public frontend URL |

**Production:** Set to your actual frontend URL. Used for password reset links and email templates.

### File Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESUME_STORAGE_PATH` | No | `./uploads/resumes` | Local filesystem path for uploaded resumes |

**Production:** Use S3-compatible storage instead of local filesystem for scalability and backup.

## Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8080` | Backend API base URL (do not include `/api` suffix) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public frontend URL (SEO, OG tags, absolute links) |

**Production:**
- `NEXT_PUBLIC_API_URL` → `https://api.yourdomain.com`
- `NEXT_PUBLIC_APP_URL` → `https://app.yourdomain.com`

> Only `NEXT_PUBLIC_*` variables are available in the browser. All other variables in `frontend/.env.local` are server-side only.

## Inline Configuration (not env vars)

The following are configured directly in application.yml and typically don't need environment variable overrides:

- **Token expiration:** Access token = 15 min, Refresh token = 7 days
- **Account lockout:** 5 attempts, 15 min duration
- **Rate limiting:** Auth = 10 req/min, Free tier = 5 req/month, Pro tier = 10000 req/month
- **Upload limits:** 5MB per file, 10MB per request
- **Hikari pool:** Max 20 connections, min 5 idle
- **Logging:** DEBUG for app, INFO for Spring Security
