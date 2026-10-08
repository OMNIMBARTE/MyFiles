/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          card: 'var(--color-bg-card)',
          hover: 'var(--color-bg-hover)',
          active: 'var(--color-bg-active)',
          border: 'var(--color-border)',
          'border-highlight': 'var(--color-border-highlight)',
          text: 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          accent: 'var(--color-accent)',
          'accent-subtle': 'var(--color-accent-subtle)',
          'accent-glow': 'var(--color-accent-glow)',
          glow: 'var(--color-glow)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px var(--color-glow, rgba(0,0,0,0.3))',
        'glow': '0 0 25px -2px var(--color-glow, rgba(0,0,0,0.3))',
        'glow-lg': '0 0 40px 0px var(--color-glow, rgba(0,0,0,0.3))',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-breathe': 'glowBreathe 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glowBreathe: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
