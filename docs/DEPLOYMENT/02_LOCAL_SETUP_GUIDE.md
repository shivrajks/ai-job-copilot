# Local Development Setup Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 (LTS) | Eclipse Adoptium / Temurin recommended |
| Maven | 3.9+ | Included via `env-setup.bat` on Windows |
| Node.js | 20+ | LTS version recommended |
| npm | 10+ | Ships with Node.js |
| Docker Desktop | Latest | Required for PostgreSQL + Redis |

## Quick Start (5 minutes)

### 1. Clone and navigate

```bash
git clone <repository-url>
cd AI-Job-Copilot
```

### 2. Start infrastructure

```bash
cd docker
docker compose up -d
```

This starts PostgreSQL 16 and Redis 7 in detached mode.

### 3. Backend setup

```bash
# Windows (PowerShell)
$env:JWT_SECRET="dev-jwt-secret-key-ai-copilot-2024-at-least-256-bits-long!!"
cd backend
mvn clean test        # Verify 286 tests pass
mvn spring-boot:run  # Starts on http://localhost:8080/api

# macOS / Linux
export JWT_SECRET="dev-jwt-secret-key-ai-copilot-2024-at-least-256-bits-long!!"
cd backend
mvn clean test
mvn spring-boot:run
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:3000
```

### 5. Open the app

Visit **http://localhost:3000** in your browser.

## Environment Files

### Backend

Copy `backend/.env.example` to `backend/.env` (or set via system env vars):

```bash
cp backend/.env.example backend/.env
```

The defaults in `.env.example` work with the local Docker Compose setup.

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

Default values:
- `NEXT_PUBLIC_API_URL=http://localhost:8080`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Running Tests

### Backend (286 tests)

```bash
cd backend
mvn clean test
```

Tests use Testcontainers (spins up a disposable PostgreSQL container). No external services required.

### Frontend

```bash
cd frontend
npm run type-check   # TypeScript type checking
npm run lint          # ESLint
npm run build         # Production build (verifies compilation)
```

## Common Tasks

### Reset database

```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

This destroys all volumes and recreates them. Flyway migrations will reapply automatically.

### Reset everything (full clean)

```bash
# Stop and destroy infrastructure
docker compose -f docker/docker-compose.yml down -v

# Clean backend
cd backend
mvn clean

# Clean frontend
cd frontend
rm -rf node_modules .next
npm install

# Restart
docker compose -f docker/docker-compose.yml up -d
```

### Enable Gemini AI

Set these environment variables before starting the backend:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-actual-gemini-api-key
```

Get a free API key at https://aistudio.google.com/apikey

## Project Structure

```
AI-Job-Copilot/
├── backend/              # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/     # Java source code
│   │   │   └── resources/ # Config, migrations, templates
│   │   └── test/         # JUnit 5 + Testcontainers tests
│   ├── pom.xml
│   └── uploads/          # Resume file storage
├── frontend/             # Next.js 15 application
│   └── src/
│       ├── app/          # App Router pages
│       └── components/   # React components
├── docker/               # Docker Compose for local dev
├── docs/                 # Project documentation
│   ├── AI_ENGINEERING/   # Engineering standards
│   └── PROJECT/          # Product docs, changelog, roadmap
└── README.md
```

## Environment Setup Script (Windows)

For Windows users, `backend/env-setup.bat` configures JAVA_HOME and MAVEN_HOME automatically:

```batch
cd backend
env-setup.bat
```
