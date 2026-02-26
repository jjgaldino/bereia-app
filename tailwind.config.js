/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bereia: {
          50: "#fdfcfa",
          100: "#faf6f1",
          200: "#f5f0eb",
          300: "#ede7e0",
          400: "#d7ccc8",
          500: "#bcaaa4",
          600: "#8d6e63",
          700: "#6d4c41",
          800: "#5d4037",
          900: "#4e342e",
          950: "#3e2723",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulse3: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.5s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'spin-slow': 'spin 0.8s linear infinite',
        'pulse3': 'pulse3 1.2s ease infinite',
      },
    },
  },
  plugins: [],
};
