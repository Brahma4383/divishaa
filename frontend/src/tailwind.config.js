/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6F0",
        "ivory-deep": "#F1EAE0",
        ink: "#1B1713",
        beige: "#E7DBC8",
        gold: "#AD8A54",
        "gold-soft": "#D8C9A8",
        maroon: "#6E2430",
        gray: {
          DEFAULT: "#8A8175",
          light: "#C9C2B5",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        sans: ["'Jost'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
