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
          50: '#fffef0',
          100: '#fefce8',
          200: '#fef9c3',
          300: '#fef08a',
          300: '#fef08a',
          300: '#fef08a',
          300: '#fef08a',
          300: '#fef08a',
          800: '#a16207',
          900: '#854d0e',
        },
      },
    },
  },
  plugins: [],
}