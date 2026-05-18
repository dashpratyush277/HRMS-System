/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dce6ff",
          200: "#b9cdff",
          300: "#86a9ff",
          400: "#527aff",
          500: "#2d52ff",
          600: "#1a35f5",
          700: "#1426e1",
          800: "#1721b5",
          900: "#19218f",
          950: "#121457",
        },
        slate: {
          850: "#1a2035",
          950: "#0d1117",
        },
      },
    },
  },
  plugins: [],
};
