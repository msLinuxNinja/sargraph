/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    screens: {
      // media query for ultra wide screens
      'ultra': '2561px',
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
