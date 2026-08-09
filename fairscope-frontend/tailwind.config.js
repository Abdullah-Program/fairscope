/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // FairScope design system — extracted from AI dashboard inspiration
        base: {
          950: "#080B12",   // page background, deepest
          900: "#0A0E17",   // main background
          800: "#111827",   // section background
          700: "#151B2C",   // card background
          600: "#1C2438",   // card hover / elevated
          border: "#232937",
        },
        accent: {
          blue: "#4A7FFF",
          "blue-dim": "#2C4A99",
          teal: "#2DD4BF",
          emerald: "#10B981",
          purple: "#8B5CF6",
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
        },
        ink: {
          primary: "#F3F5F9",
          secondary: "#9BA3B4",
          muted: "#5C6478",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(74, 127, 255, 0.35)",
        card: "0 4px 24px -4px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, #080B12), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
