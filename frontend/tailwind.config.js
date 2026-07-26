/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            deep: '#03001e', // Dark premium background
            navy: '#0b2447', // Sleek cards
            light: '#19376d', // Interactive components
            accent: '#576cbc', // Subtle buttons
          },
          gold: {
            DEFAULT: '#d4af37', // Pure Gold
            light: '#f3e5ab', // Soft highlights
            dark: '#aa7c11', // Borders/Shadows
            shimmer: '#ffd700', // Hover states
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
