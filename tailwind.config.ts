import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d3d8e0",
          300: "#a8b1bf",
          400: "#7a8499",
          500: "#525b6e",
          600: "#3a4254",
          700: "#262d3c",
          800: "#171c28",
          900: "#0c1018"
        },
        court: {
          gold: "#D4A574",
          green: "#16a34a",
          red: "#dc2626",
          blue: "#7AA2D4"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Helvetica", "Arial"]
      }
    }
  },
  plugins: []
};

export default config;
