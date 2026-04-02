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
        ink:    '#282420',   // warm near-black
        muted:  '#8c8278',   // warm mid-gray
        subtle: '#b8b0a8',   // light warm gray
        rule:   '#e8e2dc',   // warm rule / border
        warm:   '#f5f2ef',   // warm off-white (image bg placeholder)
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
