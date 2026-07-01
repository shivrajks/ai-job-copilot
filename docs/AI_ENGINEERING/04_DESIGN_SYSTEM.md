# Design System

**Purpose:** Defines the visual design tokens, component library, and styling conventions.

---

## 1. Visual Identity

The application uses a glassmorphism design system with:
- Frosted glass surfaces (backdrop-filter: blur, semi-transparent backgrounds)
- Gradient accents (indigo to purple spectrum)
- Clean typography (Inter font family)
- Subtle micro-interactions (Framer Motion)

## 2. Where Design Tokens Live

- CSS custom properties are defined in `src/app/globals.css`.
- Both light and dark mode are supported via `.light` and `.dark` class selectors.
- Tailwind CSS v3.4 is the utility framework. Custom values extend the Tailwind theme in `tailwind.config.js`.

## 3. Component Library

- UI primitives use shadcn/ui with Radix UI under the hood.
- Existing components: Button, Input, Label.
- All new UI components should be added to `src/components/ui/` following shadcn conventions.
- Custom domain components live in `src/components/` grouped by feature.

## 4. Styling Rules

- Use `cn()` utility (clsx + tailwind-merge) for conditional class merging.
- Do not write raw CSS unless absolutely necessary. Prefer Tailwind utility classes.
- Glassmorphism effects use the pattern: `bg-card/30 backdrop-blur-xl border border-border/50`.
- Dark mode must be tested alongside light mode for every component.

## 5. Animation Rules

- Framer Motion is the animation library.
- Page transitions: fade + slide up (initial: opacity 0, y: 20).
- Micro-interactions should be subtle (< 300ms) and not interfere with usability.
- Respect `prefers-reduced-motion` for accessibility.
- Do not animate critical interactions (form submissions, navigation).

## 6. Responsiveness

- Mobile-first approach. Every component must work at 375px width.
- The dashboard layout uses a sidebar that collapses on mobile.
- Touch targets must be at least 44x44px on mobile.
