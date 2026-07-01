# UI/UX Principles

**Purpose:** Defines the interaction design principles and user experience standards.

---

## 1. Core Principles

- **Clarity over cleverness.** Users should understand every screen within 3 seconds.
- **Feedback for every action.** Loading spinners, success messages, error alerts — never leave a user guessing.
- **Progressive disclosure.** Show advanced options only when needed. Do not overwhelm.
- **Consistency across screens.** Same patterns for forms, buttons, navigation throughout.

## 2. Screen State Requirements

Every screen must handle these states:

| State | What to show |
|-------|-------------|
| Loading | Skeleton loader or spinner (Framer Motion shimmer) |
| Empty | Illustration + message + CTA to take action |
| Error | Alert with clear message + retry option |
| Success | Confirmation message + next-step CTA |

## 3. Form Design

- Labels are always visible (no floating labels for initial auth screens).
- Validation errors appear inline beneath the field, not in a toast.
- Password fields have a show/hide toggle.
- Submit buttons show loading state and disable during submission.
- Success navigates to the next logical screen, not just a toast.

## 4. Navigation

- The primary navigation is a sidebar (dashboard context) or top bar (auth context).
- Active states are visually distinct (highlighted icon, bold text, left border accent).
- Breadcrumbs for multi-step flows (resume upload, interview sessions).
- Keyboard shortcuts for power users (Cmd/Ctrl+K command palette in future).

## 5. Micro-interactions

- Button hover: slight scale (1.02) + shadow lift.
- Card hover: subtle border glow.
- Page transitions: 400ms ease-out fade + y-offset.
- Toast notifications: slide in from top-right, auto-dismiss after 4 seconds.
- Error states: shake animation on critical validation failure.

## 6. Accessibility Minimum

- All interactive elements must be keyboard accessible.
- Color is never the only indicator of state (add icons, text, or patterns).
- Focus indicators must be visible (ring-2 offset-2 in Tailwind).
- Alt text on all images and icons with semantic meaning.
