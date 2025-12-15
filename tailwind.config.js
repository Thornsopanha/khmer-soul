/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917', // Secondary Dark
          950: '#0c0a09', // Primary Background (Deepest)
        },
        amber: {
          400: '#fbbf24', // Luminous Gold
          500: '#f59e0b', // Primary Gold
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Moulpali', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomFade: {
          '0%, 100%': { transform: 'scale(1.0)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-slow': 'fadeIn 2s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in-up-slow': 'fadeInUp 1.5s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
        'zoom-fade': 'zoomFade 20s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
