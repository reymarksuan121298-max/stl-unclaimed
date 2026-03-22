/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-teal': '#0D3B42',
        'brand-gold': '#C59B4F',
        'primary': '#0D3B42',
        'accent': '#C59B4F',
      },
    },
  },
  plugins: [],
}
