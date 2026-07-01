# Code Review Checklist

**Purpose:** Defines the mandatory review criteria for every pull request.

---

## 1. Security Review

- [ ] Does the PR expose any secrets, API keys, or tokens?
- [ ] Are all user inputs validated? (Backend: `@Valid`. Frontend: form validation.)
- [ ] Are file uploads validated by magic bytes, not just extension?
- [ ] Are authentication checks present on every protected endpoint? (`@AuthenticationPrincipal`)
- [ ] Is ownership verified before any data access? (User A cannot access User B's data.)
- [ ] Is the JWT secret environment-mandated with no default fallback?
- [ ] Are error responses free of stack traces, internal paths, or sensitive data?

## 2. Architecture Review

- [ ] Does the code follow the three-layer pattern (Controller → Service → Repository)?
- [ ] Are DTOs distinct from entities? (Never expose JPA entities directly to API consumers.)
- [ ] Is business logic in services, not controllers?
- [ ] Are migrations immutable? (No edits to committed Flyway migrations.)
- [ ] Is the frontend component in the correct directory (`components/ui/` or `components/` or co-located)?

## 3. Correctness Review

- [ ] Do all API endpoints return consistent error shapes?
- [ ] Are pagination parameters validated (page >= 0, size between 1 and max)?
- [ ] Are all transaction boundaries correct? (Read operations use `@Transactional(readOnly = true)`.)
- [ ] Are foreign key relationships properly cascaded? (CASCADE delete where appropriate.)

## 4. Code Quality Review

- [ ] Are there any TODOs, FIXMEs, or commented-out code?
- [ ] Are magic numbers or inline strings extracted to constants?
- [ ] Are files under 400 lines?
- [ ] Is the code idiomatic for its language/framework? (Not Java code written like C#.)

## 5. Testing Review

- [ ] Do new backend features have corresponding unit tests?
- [ ] Do new frontend features render all states (loading, empty, error, success)?
- [ ] Do existing tests still pass? (`mvn test` and `npm run type-check`)

## 6. Build Review

- [ ] Does `mvn clean verify` pass? (Backend)
- [ ] Does `npm run build` pass? (Frontend)
- [ ] Does `npm audit --audit-level=high` produce zero high/critical findings?
