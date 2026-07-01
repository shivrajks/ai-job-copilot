# Coding Standards

**Purpose:** Defines code style, naming conventions, and language-specific best practices.

---

## 1. General Rules

- No commented-out code. Delete it.
- No TODO or FIXME in committed code. Create a ticket instead.
- No magic numbers or inline strings. Use constants or enums.
- No sysout or print. Use the project logger.
- Every public method must be self-documenting. If it needs a comment, rename it.
- Keep files under 400 lines. Split large classes by concern.

## 2. Backend (Java 21 + Spring Boot)

- Use Lombok (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`) to reduce boilerplate.
- Use constructor injection. Never `@Autowired` on fields.
- `@Transactional` on service methods that mutate data.
- DTOs are inner static classes of a single DTO file per domain (see `AuthDtos.java`, `ResumeDtos.java`).
- Validation annotations on DTO fields (`@NotBlank`, `@Email`, `@Size`, `@Pattern`).
- Exception throwing uses `AppException` with `HttpStatus`; never raw exceptions in controllers.
- Log at appropriate level: INFO for state changes, WARN for recoverable issues, ERROR for failures.

## 3. Frontend (TypeScript + React 19 + Next.js 15)

- Use 'use client' directive only when necessary (hooks, state, effects, browser APIs).
- Prefer server components by default.
- Types are defined inline or in co-located `.ts` files. Avoid a global `types/` folder for domain types.
- State lifting: prop drilling up to 3 levels is acceptable; beyond that use Zustand or React Query.
- Async data fetching always uses `@tanstack/react-query` with proper loading/error types.
- Tailwind classes should be ordered: layout → sizing → spacing → typography → color → effects.

## 4. Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| Java classes | PascalCase | `AuthService`, `JwtTokenProvider` |
| Java methods | camelCase | `generateAccessToken()` |
| Java constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| TypeScript/React | PascalCase (components), camelCase (functions) | `UserProfile`, `handleSubmit` |
| Files (Java) | ClassName.java | `ResumeController.java` |
| Files (TSX) | kebab-case | `forgot-password/page.tsx` |
| Database | snake_case | `user_id`, `created_at` |
