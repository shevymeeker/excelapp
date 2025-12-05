/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          600: '#ff6a00',
          700: '#e65f00',
        }
      }
    },
  },
  plugins: [],
}
