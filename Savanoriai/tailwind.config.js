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
          50:  '#fffde6',
          100: '#fff9b8',
          200: '#fff38a',
          300: '#ffec5c',
          400: '#ffe433',
          500: '#ffd60a',
          600: '#ffc800',
          700: '#c79a00',
          800: '#9a7600',
          900: '#6e5400',
        },
      },
    },
  },
  plugins: [],
}