/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // African Union green (matches the admin layout's #1f5c52).
      // The blue/purple/pink palettes are remapped so every page shares the brand.
      colors: {
        blue: {
          50: '#f0f7f5', 100: '#dcece8', 200: '#b9d9d1', 300: '#8fc1b6', 400: '#5da394',
          500: '#2f7d70', 600: '#1f5c52', 700: '#194a42', 800: '#143b35', 900: '#0f2d28',
        },
        purple: { 50: '#f6f9f8', 100: '#e8f0ed' },
        pink: { 50: '#faf6e8', 100: '#f3ead0' },
      },
    },
  },
  plugins: [],
}

