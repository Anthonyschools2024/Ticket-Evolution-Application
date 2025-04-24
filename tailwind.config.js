/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.html",   // Scan all HTML files in the views folder
    "./public/**/*.js"    // Scan all JS files in the public folder
  ],
  theme: {
    extend: {}, // You can add custom theme settings here later
  },
  plugins: [], // You can add Tailwind plugins here later
}
