# Sprint Workflow

**Purpose:** Defines the sprint lifecycle, ceremonies, and delivery process.

---

## 1. Sprint Structure

Each sprint has five phases:

1. **Discovery** — Understand the existing codebase. Trace the execution path. Identify what must change.
2. **Planning** — Verify each task against the Engineering Constitution. Challenge the request. Do not blindly implement.
3. **Implementation** — Write code in small, verifiable increments. Build and test after each logical group.
4. **Self-Review** — Review your own code using the Code Review Checklist. Fix issues before declaring done.
5. **Stabilization** — Run full build verification. Fix regressions. Produce a summary report.

## 2. Sprint Rules

- Do not start the next sprint until the current sprint is approved.
- Do not mix concerns. A sprint for UI does not touch backend business logic.
- Do not refactor working code unless a verified bug or blocking technical debt exists.
- Every commit must compile independently. No broken commits.
- If a task is larger than one sprint, split it. Do not carry incomplete work across sprints.

## 3. Build Verification Gate

After every implementation phase, run:

| Layer | Command |
|-------|---------|
| Backend | `mvn clean verify` |
| Frontend | `npm run type-check && npm run build` |
| Audit | `npm audit --audit-level=high` |

If any step fails, fix the root cause. Do not suppress errors.

## 4. Sprint Output

Every sprint must produce:
- Summary of what was built and why
- List of files modified with line numbers
- Build verification results
- Test results
- Known remaining technical debt
- Risks for the next sprint

## 5. Stopping

After producing the sprint report, STOP. Wait for the next sprint assignment. Do not auto-continue.
