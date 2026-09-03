/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#C1272E",
        "primary-hover": "#A91E24",
        background: "#FFFBF5",
        surface: "#FFF0E6",
        "surface-hover": "#FFD8B8",
        // legacy aliases - mapped to new palette for backward compat
        peach: "#FFF0E6",
        cream: "#FFFBF5",
        peachDark: "#FFD8B8",
        dark: "#1A1E1D",
        muted: "#6B7280",
        accent: "#C9A86A",
        "accent-hover": "#B8944F",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        bayon: ["Poppins", "sans-serif"],
        korosu: ["Poppins", "sans-serif"],
        inria: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
