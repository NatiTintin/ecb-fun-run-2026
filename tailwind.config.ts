import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFAF3',
        ink: '#1F2937',
        brand: {
          50: '#FFF4ED',
          100: '#FFE4D2',
          200: '#FFC7A3',
          300: '#FFA267',
          400: '#FF7A33',
          500: '#FF5A1F',
          600: '#F04315',
          700: '#C7330F',
          800: '#9E2A12',
          900: '#7F2513',
        },
        teal: {
          50: '#ECFDFB',
          100: '#CFFAF4',
          400: '#22C7B5',
          500: '#0FA99A',
          600: '#0B8A7E',
        },
        sunshine: {
          300: '#FFD666',
          400: '#FFC633',
          500: '#FFB800',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(255, 90, 31, 0.25)',
        card: '0 2px 12px rgba(31, 41, 55, 0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
