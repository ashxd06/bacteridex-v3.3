import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#060A12",
          900: "#0B1220",
          800: "#101A2C",
          700: "#172238",
          600: "#22314D"
        },
        mist: {
          400: "#5B7089",
          300: "#8FA1B8",
          200: "#C4D0DE",
          100: "#E8EDF4"
        },
        bio: {
          DEFAULT: "#22C7E0",
          dim: "#0E93A6",
          glow: "#7FE8F5"
        },
        cian: {
          DEFAULT: "#22C7E0",
          dim: "#0E93A6",
          glow: "#7FE8F5"
        },
        gene: {
          DEFAULT: "#8B6BFF",
          dim: "#5B3FCF"
        },
        verde: {
          DEFAULT: "#2FB872",
          dim: "#1D7C4C"
        },
        alert: {
          DEFAULT: "#FF6B5B",
          dim: "#C23F32"
        },
        gold: {
          DEFAULT: "#F2B84B"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(143,161,184,0.14) 1px, transparent 0)"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        scan: "scan 2.4s linear infinite",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
