# AI Job Application Copilot

A production-grade SaaS platform that helps job seekers optimize resumes, analyze job descriptions, prepare for interviews, and track applications using AI.

## Architecture

```
AI-Job-Copilot/
├── backend/          # Spring Boot 3 + Java 21 + Maven
├── frontend/         # Next.js 15 + TypeScript + Tailwind + ShadCN
├── docker/           # PostgreSQL + Redis
└── docs/             # Documentation
```

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.3
- Spring Security + JWT
- PostgreSQL + Flyway
- Redis
- LangChain4j + Gemini API
- Maven

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion
- React Query
- Zustand

### Infrastructure
- Docker Compose (local)
- AWS (production)
- GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Java 21
- Node.js 20+
- Maven 3.9+
- Docker Desktop

### 1. Start Infrastructure

```bash
cd docker
docker compose up -d
```

### 2. Run Backend

```bash
cd backend
export JWT_SECRET="$(openssl rand -base64 32)"
mvn spring-boot:run
```

On Windows PowerShell, set `$env:JWT_SECRET` to a random 32+ character value before running Maven.

API available at `http://localhost:8080/api`

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh JWT token |

## License

MIT
