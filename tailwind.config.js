/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        stone: {
          bg: "#F7F8FA",
          card: "#FFFFFF",
          line: "#E4E7EC",
        },
        ink: {
          DEFAULT: "#12151C",
          soft: "#5B6472",
        },
        brass: {
          DEFAULT: "#3454D1",
          dark: "#28409E",
          soft: "#DCE4FA",
        },
        sage: "#1E9E6B",
        rust: "#DC4C4C",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "70ch",
      },
      borderRadius: {
        DEFAULT: "8px",x
      },
    },
  },
  plugins: [],
}

