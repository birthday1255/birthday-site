import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#c084fc",
          bright: "#e879f9",
          dim: "#7c3aed",
          subtle: "rgba(139, 92, 246, 0.08)",
        },
        surface: {
          DEFAULT: "#0c0c14",
          elevated: "#141420",
          overlay: "rgba(255, 255, 255, 0.03)",
        },
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-violet":
          "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
        "gradient-pink":
          "linear-gradient(135deg, #ec4899, #f472b6, #f9a8d4)",
        "gradient-mixed":
          "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
      },
      animation: {
        "float-cake": "float-cake 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 6s ease-in-out infinite",
        "fade-slide-up":
          "fade-slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "spin-in":
          "spin-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "scale-in":
          "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "bounce-in":
          "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        aurora: "aurora 20s ease-in-out infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
        wave: "wave 1.5s ease-in-out 2",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
      keyframes: {
        "float-cake": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(-3deg) scale(1)",
          },
          "50%": {
            transform: "translateY(-16px) rotate(3deg) scale(1.05)",
          },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.12", transform: "scale(1)" },
          "50%": { opacity: "0.28", transform: "scale(1.1)" },
        },
        "fade-slide-up": {
          from: { opacity: "0", transform: "translateY(32px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-in": {
          from: { opacity: "0", transform: "scale(0.3) rotate(-30deg)" },
          to: { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "25%": { backgroundPosition: "50% 100%" },
          "50%": { backgroundPosition: "100% 50%" },
          "75%": { backgroundPosition: "50% 0%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        sparkle: {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0.5) rotate(0deg)",
          },
          "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
        },
        wave: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(20deg)" },
          "50%": { transform: "rotate(-10deg)" },
          "75%": { transform: "rotate(15deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
