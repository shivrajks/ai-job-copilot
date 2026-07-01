# Engineering Constitution

**Purpose:** Defines permanent engineering standards for this repository.

---

## 1. Source of Truth

This Engineering Manual is the sole authority for development practices. Every AI agent and human contributor must read these documents before writing code.

## 2. Hierarchy

01 — Constitution (this file)
02 — Product DNA (why we build)
03 — Architecture Rules (how we structure)
04 — Design System (visual language)
05 — UI/UX Principles (interaction standards)
06 — Coding Standards (language rules)
07 — Code Review Checklist (acceptance gates)
08 — Sprint Workflow (how we ship)
09 — Definition of Done (when it ships)
10 — AI Agent Rules (machine constraints)

## 3. Golden Rules

- Analyze before coding. Never write code without understanding the existing system first.
- Protect existing functionality at all costs. Regression is worse than missing a new feature.
- Verify before claiming success. Run the build, run the tests, confirm the output.
- Build and test after every logical group of changes. Never batch multiple days of work without verification.
- Stop after each sprint. Wait for approval. Do not auto-proceed.
- Do not modify unrelated files. Every change must have a clear, documented justification.
- Do not invent APIs, fields, or endpoints unless explicitly requested.
- Avoid overengineering. Solve the stated problem, not an imagined future one.
- Every feature must be portfolio-worthy. This code is visible to potential employers and clients.
- Security is not optional. Authentication, authorization, input validation, and secret management are always in scope.

## 4. Violations

Violations of the Constitution must be called out during code review. Repeated violations block merge.
