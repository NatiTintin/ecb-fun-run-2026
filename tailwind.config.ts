import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFAF3',
        ink: '#1F2937',
        // ECB 60th-anniversary palette — gold as the primary/CTA color,
        // navy as the dark/hero color. Matches the ECB logo (navy field,
        // gold cross + "60" mark).
        brand: {
          50: '#FAF6EC',
          100: '#F1E6C8',
          200: '#E4D09B',
          300: '#D6B96D',
          400: '#C9A45C',
          500: '#BC9245',
          600: '#A67D38',
          700: '#8A672E',
          800: '#6E5225',
          900: '#584219',
        },
        navy: {
          50: '#EAF0F8',
          100: '#C7D6E8',
          200: '#9CB6D3',
          300: '#6E93BC',
          400: '#3F6DA0',
          500: '#234E7E',
          600: '#173A63',
          700: '#112C4C',
          800: '#0E2240',
          900: '#0A1830',
        },
        teal: {
          50: '#ECFDFB',
          100: '#CFFAF4',
          400: '#22C7B5',
          500: '#0FA99A',
          600: '#0B8A7E',
        },
      },
      fontFamily: {
        sans: ['var(--font-latin)', 'var(--font-thai)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(188, 146, 69, 0.35)',
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
