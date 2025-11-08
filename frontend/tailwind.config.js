/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: {
          red: '#DC143C',
          black: '#1a1a1a',
        },
        table: {
          green: '#0B5D1E',
          felt: '#1B7A31',
        }
      },
      fontFamily: {
        card: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
