import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Orion Nebula Palette ──────────────────────────────────────
        orion: {
          void:    "#050A14",   // deepest background
          surface: "#0A1628",   // panels / cards
          border:  "#1A2F4A",   // grid lines / dividers
          cyan:    "#00D4FF",   // primary accent — electric cyan
          orange:  "#FF6B35",   // secondary accent — stellar orange
          violet:  "#7C3AED",   // AI thinking state — nebula violet
          ice:     "#E8F4FD",   // primary text
          muted:   "#6B8CAE",   // secondary text / labels
        },
      },
      fontFamily: {
        orion: ["var(--font-orion)", "monospace"],
        mono:  ["var(--font-mono)",  "monospace"],
      },
      boxShadow: {
        "glow-cyan":   "0 0 20px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.15)",
        "glow-orange": "0 0 20px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 107, 53, 0.15)",
        "glow-violet": "0 0 20px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124, 58, 237, 0.15)",
      },
      animation: {
        "orb-idle":    "orbIdle 3s ease-in-out infinite",
        "orb-think":   "orbThink 1s linear infinite",
        "orb-speak":   "orbSpeak 0.4s ease-in-out infinite",
        "scan-line":   "scanLine 4s linear infinite",
        "flicker":     "flicker 0.15s infinite",
      },
      keyframes: {
        orbIdle: {
          "0%, 100%": { transform: "scale(1)",    opacity: "0.8" },
          "50%":      { transform: "scale(1.06)", opacity: "1"   },
        },
        orbThink: {
          "0%":   { transform: "rotate(0deg)"   },
          "100%": { transform: "rotate(360deg)" },
        },
        orbSpeak: {
          "0%, 100%": { transform: "scale(1)"    },
          "50%":      { transform: "scale(1.12)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1"   },
          "50%":      { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
