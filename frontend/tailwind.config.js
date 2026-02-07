/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946', // Blood Red
        secondary: '#F1FAEE', // Off White
        accent: '#457B9D', // Steel Blue
        dark: '#1D3557', // Navy
      }
    },
  },
  plugins: [],
}
