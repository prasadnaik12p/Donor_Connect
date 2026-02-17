// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#dc2626",
        secondary: "#2563eb",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};