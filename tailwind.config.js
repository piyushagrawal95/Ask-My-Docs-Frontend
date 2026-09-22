/** @type {import('tailwindcss').Config} */
export default {
  darkMode:"class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: {
          DEFAULT: "var(--color-shell, #16213B)",
          light: "var(--color-shell-light, #203050)",
          line: "var(--color-shell-line, #2C3E63)",
        },
        paper: {
          DEFAULT: "var(--color-paper)",
          card: "var(--color-paper-card)",
          line: "var(--color-paper-line)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          soft: "var(--color-ink-soft)",
          onshell: "var(--color-ink-onshell, #E9E6DA)",
          onshellsoft: "var(--color-ink-onshellsoft, #8D97B5)",
        },
        moss: {
          DEFAULT: "var(--color-moss)",
          dark: "var(--color-moss-dark, #234639)",
          soft: "var(--color-moss-soft)",
        },
        brass: {
          DEFAULT: "var(--color-brass, #B08946)",
          dark: "var(--color-brass-dark, #8F6E34)",
          soft: "var(--color-brass-soft, #F1E6CC)",
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