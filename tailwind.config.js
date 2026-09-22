/** @type {import('tailwindcss').Config} */
export default {
  darkMode:"class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: {
          DEFAULT: "#16213B",
          light: "#203050",
          line: "#2C3E63",
        },
        paper: {
          DEFAULT: "var(--color-paper)",
          card: "var(--color-paper-card)",
          line: "var(--color-paper-line)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          soft: "var(--color-ink-soft)",
          onshell: "#E9E6DA",
          onshellsoft: "#8D97B5",
        },
        moss: {
          DEFAULT: "var(--color-moss)",
          dark: "#234639",
          soft: "var(--color-moss-soft)",
        },
        brass: {
          DEFAULT: "#B08946",
          dark: "#8F6E34",
          soft: "#F1E6CC",
        },
        rust: "#B3392E",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: "0.25" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.28s ease-out",
        blink: "blink 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
}