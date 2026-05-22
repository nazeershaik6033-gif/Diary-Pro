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
          50: '#fdf9f3',
          100: '#f9f1e4',
          200: '#f5f0e8',
          300: '#ede3d0',
          400: '#ddd0b8',
          DEFAULT: '#f5f0e8',
        },
        ink: {
          50: '#f5f0ee',
          100: '#e8d8d2',
          200: '#c4a99f',
          300: '#9a7060',
          400: '#6b3d30',
          500: '#2C1810',
          600: '#221209',
          700: '#180d06',
          DEFAULT: '#2C1810',
        },
        amber: {
          warm: '#C4933F',
          light: '#d4a84f',
          dark: '#a37430',
          faint: '#f7ead8',
        },
        sage: {
          DEFAULT: '#7a9e7e',
          light: '#a5c4a9',
          dark: '#527556',
        },
        blush: {
          DEFAULT: '#c4857a',
          light: '#d4a099',
          dark: '#9a5f56',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-lato)', 'Lato', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(44, 24, 16, 0.08), 0 1px 2px rgba(44, 24, 16, 0.06)',
        'warm': '0 4px 6px rgba(44, 24, 16, 0.07), 0 2px 4px rgba(44, 24, 16, 0.06)',
        'warm-md': '0 10px 15px rgba(44, 24, 16, 0.1), 0 4px 6px rgba(44, 24, 16, 0.07)',
        'warm-lg': '0 20px 25px rgba(44, 24, 16, 0.1), 0 10px 10px rgba(44, 24, 16, 0.06)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23f5f0e8'/%3E%3Crect x='0' y='0' width='1' height='1' fill='rgba(44,24,16,0.03)'/%3E%3Crect x='2' y='2' width='1' height='1' fill='rgba(44,24,16,0.02)'/%3E%3C/svg%3E\")",
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-once': 'bounceOnce 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
