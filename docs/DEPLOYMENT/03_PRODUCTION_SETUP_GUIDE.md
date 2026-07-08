# Production Setup Guide

## Architecture Overview

```
                         ┌─────────────────┐
                         │   Cloud Load    │
                         │   Balancer      │
                         └────────┬────────┘
                                  │
                   ┌──────────────┼──────────────┐
                   │              │              │
            ┌──────┴──────┐ ┌────┴─────┐ ┌──────┴──────┐
            │  Frontend   │ │ Backend  │ │  Backend    │
            │ Next.js 15  │ │ Instance │ │  Instance   │
            │ (x2-4)      │ │  1       │ │  2          │
            └──────┬──────┘ └────┬─────┘ └──────┬──────┘
                   │              │              │
                   │        ┌─────┴──────────────┘
                   │        │
            ┌──────┴──┐ ┌───┴──────┐  ┌────────────┐
            │  Cloud  │ │ Managed  │  │   Redis    │
            │  CDN    │ │ PostgreSQL│  │  Cluster   │
            └─────────┘ └──────────┘  └────────────┘
```

## Prerequisites

- AWS account (or GCP / Azure equivalent)
- Domain name with DNS access
- SSL/TLS certificate (AWS Certificate Manager or Let's Encrypt)
- Container registry (ECR, Docker Hub, or similar)

## Infrastructure Options

### Option A: AWS (Recommended)

| Service | Purpose | Estimated Cost |
|---------|---------|---------------|
| ECS Fargate | Container orchestration | $30-60/month |
| RDS PostgreSQL | Database | $15-30/month (t3.small) |
| ElastiCache Redis | Caching | $15-20/month |
| ALB | Load balancing | $20-25/month |
| CloudFront | CDN | Pay-per-use |
| S3 | File storage | $0.023/GB |
| Route 53 | DNS | $0.50/month |
| Certificate Manager | SSL/TLS | Free |
| **Total** | | **~$80-150/month** |

### Option B: VPS (Cheaper)

| Service | Purpose | Estimated Cost |
|---------|---------|---------------|
| Single VPS (8GB RAM, 4 vCPU) | All services | $20-40/month |
| Managed PostgreSQL | Database | $10-15/month |
| **Total** | | **~$30-55/month** |

## Build & Deploy

### 1. Build Backend Docker Image

Create a Dockerfile in `backend/`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/ai-job-copilot-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build:

```bash
cd backend
mvn clean package -DskipTests
docker build -t ai-job-copilot-api:latest .
docker tag ai-job-copilot-api:latest <your-registry>/ai-job-copilot-api:latest
docker push <your-registry>/ai-job-copilot-api:latest
```

### 2. Build Frontend

```bash
cd frontend
npm ci
npm run build
```

Output is in `.next/`. Deploy to Vercel, Cloudflare Pages, or serve via Docker with `npm run start`.

### 3. Deploy Infrastructure

```bash
# Start PostgreSQL and Redis (managed services or self-hosted)
# Run database migrations
cd backend
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://<host>:5432/<db> \
                    -Dflyway.user=<user> \
                    -Dflyway.password=<password>
```

### 4. Set Environment Variables

All via your deployment platform's secrets management:

**Backend (required):**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET` (generated fresh for production)
- `CORS_ALLOWED_ORIGINS` (your frontend domain)
- `APP_BASE_URL` (your frontend domain)

**Frontend (required):**
- `NEXT_PUBLIC_API_URL` (your backend domain, e.g., `https://api.yourdomain.com`)

## Production Checklist

- [ ] JWT secret generated fresh (not copied from dev)
- [ ] Gemini API key configured with proper quota
- [ ] SMTP configured with transactional email provider
- [ ] CORS origins restricted to frontend domain only
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Secure, HttpOnly, SameSite cookies configured
- [ ] Rate limiting enabled
- [ ] Database backups configured (daily minimum)
- [ ] Health check endpoints monitored
- [ ] Log aggregation set up (CloudWatch, DataDog, etc.)
- [ ] Alerting configured for 5xx errors
- [ ] SSL/TLS certificate valid and auto-renewing
- [ ] File uploads stored on S3 (not local disk)

## Database Migrations

Flyway runs automatically on startup (`spring.flyway.enabled=true`). To run manually:

```bash
# Verify status
mvn flyway:info -Dflyway.url=...

# Apply pending migrations
mvn flyway:migrate -Dflyway.url=...

# Repair if checksums changed
mvn flyway:repair -Dflyway.url=...
```

## Scaling

- **Frontend:** Horizontally scalable (stateless). Add instances behind load balancer.
- **Backend:** Horizontally scalable (stateless JWT, Redis session sharing).
- **Database:** Vertical scale first, then read replicas.
- **File storage:** Migrate from local disk to S3 when scaling beyond single instance.

## Monitoring

- **Health endpoint:** `GET /api/actuator/health`
- **Metrics endpoint:** `GET /api/actuator/metrics`
- **Key metrics:** JVM heap, DB connection pool, request latency, error rate

## Rollback Plan

1. Keep the previous working Docker image tagged (e.g., `:v1.2.3`)
2. Database migrations are designed to be backward-compatible (add-only columns)
3. To roll back: deploy previous image, restore database from pre-migration backup
4. Run `flyway:undo` if using undo migrations (currently not configured)
