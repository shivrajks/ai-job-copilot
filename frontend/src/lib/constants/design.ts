export const designTokens = {
  spacing: {
    page: {
      padding: 'px-6 md:px-8 lg:px-12',
    },
    section: {
      padding: 'py-16 md:py-24',
    },
  },

  typography: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    h2: 'text-2xl md:text-3xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  },

  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  },

  elevation: {
    flat: '',
    raised: 'shadow-md',
    elevated: 'shadow-xl',
    floating: 'shadow-2xl',
  },

  zIndex: {
    header: 50,
    sidebar: 40,
    overlay: 30,
    modal: 100,
    toast: 150,
    tooltip: 200,
  },

  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  glass: {
    card: 'bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10',
    nav: 'bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border',
    elevated:
      'bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-xl',
  },

  container: {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  },
} as const;
