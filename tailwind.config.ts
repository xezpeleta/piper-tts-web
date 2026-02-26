import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './example/**/*.{ts,html,css}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0A0615',
          900: '#160B2B',
          800: '#261247',
          700: '#3A1B66',
        },
        violet: {
          950: '#1B0D2F',
          900: '#251146',
          800: '#34146B',
          700: '#44208D',
          600: '#5A2DB2',
          500: '#7C3AED',
          400: '#9F67FF',
          300: '#C0A6FF',
          200: '#E4DBFF',
        },
        blush: {
          500: '#F472B6',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.35)',
        card: '0 24px 80px rgba(10, 6, 21, 0.35)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.35), transparent 55%), radial-gradient(circle at 85% 5%, rgba(244, 114, 182, 0.2), transparent 50%), radial-gradient(circle at 30% 90%, rgba(99, 102, 241, 0.25), transparent 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
