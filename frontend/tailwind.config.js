/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        clinical: {
          50: "#EFF6FC",
          100: "#DCEBF8",
          200: "#B3D4EE",
          300: "#7FB6E2",
          400: "#4A96D3",
          500: "#1F77BE",
          600: "#0B5FA5",
          700: "#094A82",
          800: "#0A3C66",
          900: "#0B2F50",
          950: "#071E33",
        },
        vital: {
          400: "#3FD6C5",
          500: "#1FBFAC",
          600: "#0EA08F",
        },
        warmgray: {
          50: "#FAFAF8",
          100: "#F4F4F1",
          200: "#E9E8E3",
          800: "#3A3D42",
          900: "#23262B",
        },
        alert: {
          low: "#1FA971",
          medium: "#D98C19",
          high: "#D9483D",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,47,80,0.04), 0 4px 16px rgba(11,47,80,0.06)",
        "card-hover": "0 2px 4px rgba(11,47,80,0.06), 0 12px 28px rgba(11,47,80,0.10)",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { strokeDashoffset: "0" },
          "50%": { strokeDashoffset: "-40" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 2.4s linear infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
        scaleIn: "scaleIn 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};


