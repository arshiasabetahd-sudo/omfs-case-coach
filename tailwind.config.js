/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      colors: {
        bone: {
          50: "#fdfcf9",
          100: "#f7f4ed",
          200: "#ede8db",
        },
        navy: {
          900: "#0d1b2a",
          800: "#1b2e45",
          700: "#1e3a5f",
          600: "#2a4f7c",
        },
        steel: {
          400: "#8fa8c8",
          500: "#6b8fb0",
        },
        crimson: {
          500: "#c0392b",
          600: "#a93226",
        },
        sage: {
          400: "#7fb3a0",
          500: "#5a9e8a",
        },
        amber: {
          400: "#f0a500",
          500: "#d4930a",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.35s ease forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: 0.3 },
          "40%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
