# AI Agent Rules

**Purpose:** Defines the constraints and operating procedures for AI-assisted development in this repository.

---

## 1. Pre-Code Analysis

Before writing any code, the AI agent must:
- Read the relevant files in the codebase first.
- Understand the existing patterns, conventions, and architecture.
- Explicitly state which files will be modified and why.
- Wait for approval before making changes.

## 2. Modification Boundaries

- Only modify files explicitly required by the task.
- Never modify: `package.json`, `pom.xml`, `application.yml`, database migrations, Docker config, or CI/CD config unless the task explicitly requires it.
- Never add new dependencies unless explicitly requested.
- Never change formatting, whitespace, or imports in unrelated files.

## 3. Code Generation Rules

- Follow existing patterns. If the codebase uses Lombok `@Builder`, use it. Do not switch to a different pattern.
- Do not invent fields, endpoints, or error codes that were not requested.
- Do not generate placeholder implementations. Either implement fully or leave unchanged.
- Write production code, not example code. No `// TODO: implement`, no `// your code here`.
- Verify the build after every logical change group. Do not batch changes without verification.

## 4. Communication Rules

- Report what was done, why, and what files changed.
- If a task cannot be completed as specified, explain the blocker and propose an alternative.
- Do not invent work. If the sprint is done, report completion.
- Do not continue into the next sprint without explicit approval.

## 5. Safety Rules

- Never log or expose secrets, tokens, or user data.
- Never suggest storing JWTs in localStorage in production. HTTP-only cookies are preferred.
- Never disable security features (CSRF, CORS, validation) for convenience.
- Never commit with default credentials, placeholder secrets, or debug endpoints.
- If a security issue is discovered, report it before implementing new features.

## 6. Portfolio Awareness

The AI agent must recognize that this code serves as a portfolio artifact. Every commit should demonstrate:
- Clean, idiomatic code
- Proper error handling
- Professional commit messages
- Thoughtful architecture decisions
- No shortcuts or expedient hacks
