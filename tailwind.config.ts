import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50:      'rgb(var(--paper-50) / <alpha-value>)',
          100:     'rgb(var(--paper-100) / <alpha-value>)',
          300:     'rgb(var(--paper-300) / <alpha-value>)',
          400:     'rgb(var(--paper-400) / <alpha-value>)',
          DEFAULT: 'rgb(var(--paper) / <alpha-value>)',
        },
        ink: {
          300:     'rgb(var(--ink-300) / <alpha-value>)',
          400:     'rgb(var(--ink-400) / <alpha-value>)',
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
        },
        amber: {
          warm:  'rgb(var(--amber-warm) / <alpha-value>)',
          light: 'rgb(var(--amber-light) / <alpha-value>)',
          dark:  'rgb(var(--amber-dark) / <alpha-value>)',
          faint: 'rgb(var(--amber-faint) / <alpha-value>)',
        },
        sage: {
          DEFAULT: 'rgb(var(--sage) / <alpha-value>)',
          light:   'rgb(var(--sage-light) / <alpha-value>)',
          dark:    'rgb(var(--sage-dark) / <alpha-value>)',
        },
        blush: {
          DEFAULT: 'rgb(var(--blush) / <alpha-value>)',
          light:   'rgb(var(--blush-light) / <alpha-value>)',
          dark:    'rgb(var(--blush-dark) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans:  ['var(--font-lato)', 'Lato', 'system-ui', 'sans-serif'],
        mono:  ['SF Mono', 'Monaco', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(44, 24, 16, 0.08), 0 1px 2px rgba(44, 24, 16, 0.06)',
        'warm':    '0 4px 6px rgba(44, 24, 16, 0.07), 0 2px 4px rgba(44, 24, 16, 0.06)',
        'warm-md': '0 10px 15px rgba(44, 24, 16, 0.1), 0 4px 6px rgba(44, 24, 16, 0.07)',
        'warm-lg': '0 20px 25px rgba(44, 24, 16, 0.1), 0 10px 10px rgba(44, 24, 16, 0.06)',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'bounce-once':   'bounceOnce 0.4s ease-out',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        bounceOnce:   { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.15)' }, '70%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
export default config
