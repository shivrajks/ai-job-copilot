export const navigation = {
  main: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/resumes', label: 'Resumes' },
    { href: '/jobs', label: 'Job Match' },
    { href: '/cover-letters', label: 'Cover Letters' },
    { href: '/interviews', label: 'Interview' },
    { href: '/tracker', label: 'Job Tracker' },
  ],
  landing: [
    { href: '#how-it-works', label: 'Process' },
    { href: '#features', label: 'Features' },
    { href: '#workflow', label: 'Workflow' },
    { href: '#pricing', label: 'Pricing' },
  ],
  footer: {
    product: [
      { href: '#how-it-works', label: 'Process' },
      { href: '#features', label: 'Features' },
      { href: '#workflow', label: 'Workflow' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/auth/register', label: 'Get Started' },
    ],
    resources: [
      { href: '/auth/login', label: 'Login' },
      { href: '/auth/register', label: 'Register' },
    ],
    legal: [] as { href: string; label: string }[],
  },
} as const;
