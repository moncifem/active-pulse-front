/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This is important
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // your theme extensions
    },
  },
  plugins: [],
} 