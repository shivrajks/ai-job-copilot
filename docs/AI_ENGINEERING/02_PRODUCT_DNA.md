# Product DNA

**Purpose:** Defines the product vision, core values, and user experience philosophy.

---

## 1. Product Identity

**Name:** AI Job Application Copilot
**Tagline:** Your intelligent job search partner
**Target user:** Job seekers who want AI-powered resume optimization, interview preparation, and application tracking

## 2. Core Values

- **Professional presentation:** The UI must look like a premium SaaS product (Linear, Stripe, Vercel quality). Sloppy UI damages user trust.
- **Privacy-first:** User resumes contain highly personal data. Never log file contents, never expose file paths, never leak PII.
- **AI as assistant, not oracle:** AI suggestions are recommendations, not guarantees. Users make final decisions.
- **Reliability over novelty:** A working basic feature is better than a broken advanced feature.

## 3. User Experience Principles

- Every screen must have loading, empty, error, and success states.
- Forms must validate on both client and server. Never trust the client alone.
- Authentication flows must never enumerate users (forgot password, login).
- File uploads must validate content type, magic bytes, and size before processing.
- All AI features must show usage quotas and cost feedback.

## 4. Non-Goals

- This is not a social network. No feeds, no friend systems, no public profiles.
- This is not a job board. No job listings, no recruiter marketplace.
- This is not an AI chatbot. AI serves specific, bounded features.

## 5. Portfolio Quality

Every feature must be demonstrable in a portfolio context. This means:
- Complete error handling (not just happy path)
- Responsive design (mobile + desktop)
- Dark and light mode support
- Proper loading states and transitions
- No placeholder UI, no lorem ipsum, no dead buttons
