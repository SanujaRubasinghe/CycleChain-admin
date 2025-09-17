/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1f",  // dark navy
        surface: "#141b2d",     // card bg
        border: "#2d3651",      // borders
        primary: "#2563eb",     // blue buttons
        accent: "#22c55e",      // neon green
        subtext: "#94a3b8",     // gray text
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
