# Production Deployment Checklist

Use this checklist before deploying to any production/staging environment.

## Pre-Deployment

### Secrets & Configuration

- [ ] `JWT_SECRET` generated fresh: `openssl rand -base64 32`
- [ ] All backend env vars set (no defaults used)
- [ ] `CORS_ALLOWED_ORIGINS` restricted to actual frontend domain(s)
- [ ] `APP_BASE_URL` set to actual frontend URL
- [ ] `AI_PROVIDER=gemini` with valid `GEMINI_API_KEY`
- [ ] SMTP credentials from transactional email provider
- [ ] `NEXT_PUBLIC_API_URL` set to actual backend API domain

### Database

- [ ] Database created and accessible
- [ ] Flyway migrations verified: `mvn flyway:info`
- [ ] Database backup configured (daily automated)
- [ ] Connection pool size appropriate for instance size
- [ ] Read replica strategy considered for scale

### Security

- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] SSL/TLS certificate valid and auto-renewing
- [ ] Secure cookie flag set on production
- [ ] Rate limiting configured on auth endpoints
- [ ] Account lockout enabled (5 attempts / 15 min)
- [ ] File upload validation active (type, size, content)
- [ ] No secrets in source code or Dockerfiles
- [ ] Dependency scan run (OWASP or Snyk)

### Build

- [ ] Backend: `mvn clean verify` passes (286 tests)
- [ ] Frontend: `npm run type-check` passes
- [ ] Frontend: `npm run build` succeeds
- [ ] Docker images built and tagged with version
- [ ] Docker images pushed to registry

## Deployment

### Infrastructure

- [ ] Load balancer configured with health check (`/api/actuator/health`)
- [ ] Auto-scaling group configured (min 2 instances)
- [ ] Redis cluster reachable from backend instances
- [ ] Database reachable from backend instances
- [ ] S3 bucket (or equivalent) configured for file uploads
- [ ] CDN configured for static assets

### Application

- [ ] Backend instances started and passing health checks
- [ ] Frontend deployed and communicating with backend
- [ ] Authentication flow works (register → login → API call)
- [ ] File upload works (resume PDF/DOCX)
- [ ] Email sending works (password reset)
- [ ] AI features working (resume tailoring, cover letter, interview)

### Monitoring

- [ ] Health endpoint responding: `GET /api/actuator/health`
- [ ] Log aggregation configured
- [ ] Error alerting configured (5xx threshold)
- [ ] Performance metrics collection active
- [ ] Uptime monitoring configured

## Post-Deployment

- [ ] Smoke test all critical user flows
- [ ] Verify CORS is working (no cross-origin errors)
- [ ] Verify JWTs are signing/verifying correctly
- [ ] Verify rate limiting is active
- [ ] Verify file downloads work
- [ ] Verify responsive layout on mobile
- [ ] Run Lighthouse audit (performance, accessibility, SEO)
- [ ] Verify email templates render correctly
- [ ] Check database connection pool metrics
- [ ] Review application logs for errors

## Rollback (if needed)

- [ ] Previous working Docker image tagged and available
- [ ] Database migration designed to be backward-compatible
- [ ] Rollback plan documented
- [ ] Restore database from pre-deployment backup if schema change
- [ ] Clear any cached data (Redis flush if needed)

## Ongoing

### Daily
- [ ] Check error rates and response times
- [ ] Verify database backups completed

### Weekly
- [ ] Review application logs for anomalies
- [ ] Check disk usage on file storage
- [ ] Verify SSL certificate expiry

### Monthly
- [ ] Rotate JWT secret (if feasible)
- [ ] Review and patch dependencies
- [ ] Audit user access and active sessions
- [ ] Review rate limit thresholds against usage
