# Sprint 18 — Production QA & End-to-End Verification Report

## Status: COMPLETE

## Verification Summary

| Check | Result |
|-------|--------|
| `mvn clean test` (271 tests) | ✅ 0 failures, 0 errors, 0 skipped |
| `npx tsc --noEmit` (frontend type-check) | ✅ 0 errors |
| Backend REST endpoint review (11 controllers, ~45 endpoints) | ✅ Complete |
| Frontend route review (15 routes) | ✅ Complete |
| Security audit | ✅ Complete |
| Performance review | ✅ Complete |
| Repository dead code audit | ✅ Complete |

---

## CRITICAL ISSUES (3)

### C1 — Rate limiting not implemented despite being configured
**Severity:** CRITICAL  
**Location:** `application.yml` (lines 84-88) — config exists, no code enforces it  
**Description:** `rate-limit.free-tier.requests-per-month: 5` and `pro-tier.requests-per-month: 10000` are defined but never read by any Java class. No Bucket4j, Resilience4j, or Redis-based rate limiter exists. Free-tier users can make unlimited API calls.
**Impact:** Unlimited AI parsing, scraping, brute-force of auth endpoints.
**Fix:** Wire rate-limit config via `@ConfigurationProperties`, implement a request-counting filter with Redis, or add a simple in-memory rate limiter for auth endpoints.

### C2 — Path traversal in LocalFileStorageService.retrieve() and delete()
**Severity:** CRITICAL  
**Location:** `LocalFileStorageService.java:74,90`  
**Description:** `Paths.get(fileUrl)` is used without normalization or validation. If `fileUrl` can be controlled by a client, they can read/delete arbitrary files via `../../../etc/passwd`. Currently mitigated because `originalFileUrl` is not exposed in API responses (`ResumeDtos.toDetail()` sets it to `null`), but the stored DB value could be malicious.
**Impact:** Arbitrary file read/delete on the server.
**Fix:** Normalize the path and verify it stays within `storageBasePath`:
```java
Path normalized = filePath.normalize();
if (!normalized.startsWith(storageBasePath)) {
    throw new AppException("Access denied", HttpStatus.FORBIDDEN);
}
```

### C3 — Refresh tokens stored in plaintext in database
**Severity:** CRITICAL  
**Location:** `RefreshToken.java:28`  
**Description:** The full JWT refresh token is stored as-is in the `refresh_tokens` table. A database breach exposes all active refresh tokens, allowing session hijacking.
**Impact:** Permanent session hijacking from DB leak.
**Fix:** Hash refresh tokens with SHA-256 before storage (still searchable, not reversible to JWT). Store only the hash; validate against the user-provided token.

---

## HIGH-PRIORITY ISSUES (6)

### H1 — No account lockout on failed login
**Severity:** HIGH  
**Location:** `AuthService.java`  
**Description:** No rate-limiting or lockout mechanism exists for repeated failed login attempts. An attacker can brute-force passwords without restriction.
**Impact:** Credential brute-force.
**Fix:** Implement account lockout after N failed attempts (e.g., 5 attempts → 15 min lockout), or add rate limiting on `/auth/login`.

### H2 — JWT secret strength check is a warning, not a fatal error
**Severity:** HIGH  
**Location:** `StartupValidator.java:36`  
**Description:** A short JWT secret (< 32 characters) logs a warning but allows startup. A weak secret enables token forgery.
**Impact:** Token forgery if deployed with a weak secret.
**Fix:** Change `log.warn` to throw an exception (exit startup).

### H3 — Password reset token leaked in logs when SMTP is unconfigured
**Severity:** HIGH  
**Location:** `EmailService.java:39`  
**Description:** `log.warn("SMTP not configured. Password reset email not sent to {}. Token: {}", to, token);` — the password reset token is written to logs in plaintext.
**Impact:** Anyone with log access can reset any user's password.
**Fix:** Never log the token. Log only the email address.

### H4 — Login/Register use `window.location.href` instead of Next.js `router.push()`
**Severity:** HIGH  
**Location:** `frontend/src/app/auth/login/page.tsx:56`, `frontend/src/app/auth/register/page.tsx:70`  
**Description:** Full page reloads on login/register, discarding React state and causing a flash. Auth state set by the store may be lost.
**Impact:** Poor UX; potential race condition with cookie sync.
**Fix:** Use `const router = useRouter()` and `router.push('/dashboard')`.

### H5 — `auth_token` cookie lacks `Secure` flag
**Severity:** HIGH  
**Location:** `frontend/src/providers/app-providers.tsx:17`  
**Description:** `document.cookie = \`auth_token=${token}; path=/; max-age=604800; SameSite=Lax\`` — missing `Secure` flag means the token is sent over unencrypted HTTP.
**Impact:** Token interception on HTTP connections (man-in-the-middle).
**Fix:** Add `; Secure` to the cookie string. The middleware should enforce HTTPS in production.

### H6 — OAuth button has no onClick handler
**Severity:** HIGH  
**Location:** `frontend/src/app/auth/login/page.tsx:148`  
**Description:** `<OAuthButton onClick={() => {}} />` — the Google OAuth login button is a no-op.
**Impact:** Non-functional UI element that signals an incomplete feature.
**Fix:** Either implement OAuth flow or remove the button.

---

## MEDIUM ISSUES (9)

### M1 — 4 list endpoints lack pagination
**Severity:** MEDIUM  
**Location:** `ApplicationController`, `CoverLetterController`, `JobDescriptionController`, `InterviewController`  
**Description:** `listApplications`, `listCoverLetters`, `listJobDescriptions`, `listSessions` return all records unfiltered. Performance degrades for users with thousands of records.
**Fix:** Add `Pageable` parameter with `page`, `size` defaults and delegate to `findAllByUserId(pageable)`.

### M2 — No Settings link in sidebar or navigation constants
**Severity:** MEDIUM  
**Location:** `frontend/src/components/layout/sidebar.tsx`  
**Description:** The `/settings` page exists and works but is not linked from the sidebar. Users must know the URL or rely on a user menu dropdown.
**Fix:** Add a Settings nav item to `navItems` in `sidebar.tsx`.

### M3 — Two duplicate tracker routes (`/tracker` and `/jobs-tracker`)
**Severity:** MEDIUM  
**Location:** Both `/tracker` and `/jobs-tracker` pages  
**Description:** Two separate routes with different layouts (`DashboardShell` vs `PageContainer`). Both listed in `navigation.ts`. Users are confused about which to use.
**Fix:** Consolidate into one route, or ensure consistent layout and clear differentiation.

### M4 — AnalyticsPage flashes blank content on first load
**Severity:** MEDIUM  
**Location:** `frontend/src/app/analytics/page.tsx`  
**Description:** When `data` is `null` but `error` is also `null` (between initial render and fetch completion), the content area is blank.
**Fix:** Add an intermediate loading state or guard:
```tsx
if (!data && !error) return <DashboardSkeleton />;
```

### M5 — `/interviews/[id]` loading.tsx uses wrong layout shell
**Severity:** MEDIUM  
**Location:** `frontend/src/app/interviews/[id]/loading.tsx`  
**Description:** The loading.tsx wraps content in `DashboardShell` while the actual page uses `PageContainer`. Causes layout shift during loading.
**Fix:** Match the shell in `loading.tsx` to the page's shell.

### M6 — Entities lack Bean Validation annotations
**Severity:** MEDIUM  
**Location:** All 10 entity classes  
**Description:** Entities have zero `@NotBlank`, `@Email`, `@Size`, etc. annotations. Relies entirely on database constraints. Invalid data could be persisted via non-DTO paths (tests, batch jobs).
**Fix:** Add validation annotations to entities as defense-in-depth. Best practice: validate at both DTO and entity layers.

### M7 — No refresh token rotation on access token refresh
**Severity:** MEDIUM  
**Location:** `AuthService.java`  
**Description:** When refreshing an access token, the old refresh token is revoked (good), but the old access token remains valid for its full 15-minute lifespan. Also, no refresh token rotation means a stolen refresh token can be reused until revoked.
**Fix:** Issue a new refresh token on every refresh call (rotation).

### M8 — Access tokens not blacklisted on logout
**Severity:** MEDIUM  
**Location:** `AuthService.java:logout()`  
**Description:** `revokeAllByUser()` revokes the refresh token, but the access token remains valid for its remaining lifespan (up to 15 min).
**Impact:** Brief window where a stolen access token can still be used after logout.
**Fix:** Maintain a Redis blacklist of revoked JTIs, or use short-lived access tokens (5 min) to minimize the window.

### M9 — `GlobalExceptionHandler` does not extend `ResponseEntityExceptionHandler`
**Severity:** MEDIUM  
**Location:** `GlobalExceptionHandler.java`  
**Description:** The handler manually covers 10+ exception types but could miss Spring MVC exceptions (e.g., `MissingPathVariableException`, `HttpRequestMethodNotSupportedException`). The catch-all `Exception.class` returns a generic 500 instead of the correct status.
**Fix:** Extend `ResponseEntityExceptionHandler` via `@ControllerAdvice` for automatic coverage of Spring MVC exceptions.

---

## LOW ISSUES (12)

### L1 — Duplicate tracker routes in navigation.ts
**Location:** `frontend/src/lib/constants/navigation.ts` — both `/tracker` and `/jobs-tracker` in `main` array

### L2 — Batch operations silently skip non-owned resources
**Location:** `ApplicationController.batchUpdateStage`, `batchDelete` — user receives 200 OK without knowing some IDs were skipped

### L3 — Terms of Service and Privacy Policy links are placeholders (`href="#"`)
**Location:** Footer, Register page, `navigation.ts`

### L4 — RenameDialog lacks field validation (could save empty name)
**Location:** Resume rename dialog

### L5 — CoverLetterGenerateDialog lacks inline error messages (button silently disabled)
**Location:** Cover letter generation dialog

### L6 — Settings Profile form lacks inline error feedback for empty name
**Location:** Settings page profile form

### L7 — Missing `@Min`/`@Max` on `page`/`size` query params at controller level (remediated in service)
**Location:** `JobController`, `ResumeController`

### L8 — Missing `@NotBlank` on `stage` query param in `ApplicationController.batchUpdateStage`
**Location:** `ApplicationController`

### L9 — No `MethodArgumentTypeMismatchException` handler in `GlobalExceptionHandler`
**Location:** `GlobalExceptionHandler.java` — invalid UUID path params fall through to generic 500

### L10 — `fetchSessions()` in settings store silently swallows errors (empty catch block)
**Location:** `settingsStore.ts`

### L11 — CORS hardcoded to localhost:3000 (must be externalized for production)
**Location:** `SecurityConfig.java`

### L12 — Duplicate validator patterns (CoverLetterValidator, InterviewValidator, TailorValidator nearly identical)
**Location:** 3 validator classes under `service/`

---

## STRENGTHS

1. **Ownership model**: Every resource write verifies the authenticated user owns the resource. Consistent pattern across all 10 controllers.
2. **Error handling**: `AppException` + `GlobalExceptionHandler` with structured `ErrorResponse` across all endpoints. No stack trace leaks.
3. **File upload validation**: Multi-layered (size, MIME type, extension, magic bytes). Strong.
4. **JWT implementation**: Proper type checking (access vs refresh), HS256, configurable expiration. Modern JJWT 0.12.6 API.
5. **Frontend state management**: All pages handle loading, empty, and error states. Good skeleton/card patterns.
6. **Responsive design**: Tailwind breakpoints throughout all components.
7. **Auth middleware**: Properly protects routes, redirects to login, handles token refresh with deduplication.
8. **Password policy**: BCrypt strength 12, complexity requirements (upper+lower+number+special, min 8 chars).
9. **API client**: Robust token refresh with deduplication and retry logic.
10. **Mock AI services**: Full mock layer for development without API keys (5 mock implementations).

---

## Production Readiness Score

| Category | Score (0-10) | Notes |
|----------|-------------|-------|
| **Security** | 5/10 | 3 critical issues (rate limiting, path traversal, token storage) pull this down. Auth and ownership model are strong. |
| **Error Handling** | 9/10 | Comprehensive exception handler. Minor gap in Spring MVC exception coverage. |
| **API Design** | 8/10 | Consistent patterns. Pagination gap on 4 endpoints. |
| **Frontend UX** | 7/10 | Good state coverage. OAuth dead button, missing settings link, duplicate tracker routes. |
| **Performance** | 7/10 | No pagination on 4 endpoints. No obvious render issues. |
| **Code Quality** | 8/10 | Clean architecture. Minor duplication in validators. |
| **Testing** | 6/10 | 271 tests is solid but ~40% of the codebase is untested (no controller, security, or AI service tests). |

### Overall: **7.1 / 10** — Production-ready with critical fixes required.

### Gate: 🛑 DO NOT DEPLOY without addressing C1, C2, C3, H1, H3, H5.

Items C1-C3 and H1, H3, H5 are exploitable security vulnerabilities that must be fixed before any production deployment. The remaining HIGH and MEDIUM issues should be addressed in Sprint 19 but do not block deployment.
