/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fbf4fa',
          100: '#f6e6f3',
          200: '#edcde8',
          300: '#dfa8d6',
          400: '#c977bc',
          500: '#b0529f',
          600: '#963d86',
          700: '#7c316e',
          800: '#662a5b',
          900: '#55264d',
        },
      },
    },
  },
  plugins: [],
}