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
        // Core palette — crisp white / carbon / electric accent
        carbon:      '#0A0A0A',
        'carbon-80': '#2A2A2A',
        'carbon-60': '#4A4A4A',
        slate:       '#717171',
        'soft-gray': '#C8C8C8',
        'light-gray':'#E9E9E9',
        'off-white': '#F5F5F5',
        accent:      '#00C2FF',   // electric cyan
        'accent-dim':'#0098CC',
        'accent-pale':'#E5F9FF',

        // Legacy aliases for backward compatibility
        cream:       '#F5F5F5',
        salmon:      '#00C2FF',
        'salmon-light': '#00D4FF',
        'salmon-pale': '#E5F9FF',
        charcoal:    '#0A0A0A',
        muted:       '#717171',
        border:      '#E9E9E9',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-inter)', 'system-ui', 'sans-serif'], // Keep serif alias pointing to sans for sleekness
      },
      letterSpacing: {
        widest: '0.18em',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
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
      },
    },
  },
  plugins: [],
}

export default config
