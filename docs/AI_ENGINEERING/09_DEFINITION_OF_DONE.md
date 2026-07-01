# Definition of Done

**Purpose:** Defines the acceptance criteria that must be met before any work item is considered complete.

---

## 1. Code Complete

- [ ] All acceptance criteria from the task description are met.
- [ ] Code follows the Coding Standards (06).
- [ ] No TODOs, FIXMEs, or commented-out code remain.
- [ ] No console.log, print, or sysout debugging statements.
- [ ] No unused imports, variables, or functions.
- [ ] Files are under 400 lines. If not, a tracking ticket exists to refactor.

## 2. Build Verified

- [ ] Backend: `mvn clean verify` passes.
- [ ] Frontend: `npm run type-check && npm run build` passes.
- [ ] `npm audit --audit-level=high` exits with code 0.
- [ ] No new warnings introduced beyond the existing baseline.

## 3. Security Verified

- [ ] No secrets, API keys, or hardcoded credentials in the codebase.
- [ ] All user inputs are validated on both client and server.
- [ ] All protected endpoints verify authentication and ownership.
- [ ] Error responses do not leak internal paths, stack traces, or sensitive data.

## 4. UI/UX Verified

- [ ] All screen states are handled: loading, empty, error, success.
- [ ] Form validation shows inline errors, not just toasts.
- [ ] Responsive: works at 375px and 1440px viewport widths.
- [ ] Dark mode and light mode both render correctly.

## 5. Portfolio Ready

- [ ] The feature demonstrates professional-quality UI and UX.
- [ ] Animations and transitions are smooth, not jarring.
- [ ] There are no placeholder elements, dead buttons, or lorem ipsum text.
- [ ] The feature would not embarrass a candidate in a code review.

## 6. Documentation

- [ ] New API endpoints have Swagger/OpenAPI annotations (when available).
- [ ] Complex business logic includes a brief inline explanation.
- [ ] Public methods have meaningful names that do not require separate documentation.
