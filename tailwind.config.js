/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // African Union brand (same palette as the Koha library theme):
      // AU red #952038, dark red #6B1526, gold #C0A265, light grey #F4F4F2.
      // The blue/purple/pink palettes are remapped so every page shares it.
      colors: {
        blue: {
          50: '#fbf1f3', 100: '#f5dde2', 200: '#ebbcc5', 300: '#dc8f9e', 400: '#c35a70',
          500: '#a8283f', 600: '#952038', 700: '#6b1526', 800: '#560f1e', 900: '#3f0b16',
        },
        purple: { 50: '#f4f4f2', 100: '#e9e9e5' },
        pink: { 50: '#f8f3e8', 100: '#efe4cb' },
        au: { red: '#952038', 'red-dark': '#6b1526', gold: '#c0a265', grey: '#f4f4f2' },
      },
    },
  },
  plugins: [],
}

