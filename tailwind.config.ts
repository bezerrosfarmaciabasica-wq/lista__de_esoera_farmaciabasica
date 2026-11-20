import type { Config } from "tailwindcss";

// Cores extraídas da logomarca Rina Sistemas (verde-floresta, esmeralda e ouro)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        floresta: { 950: "#06201a", 900: "#0a2e24", 800: "#103d30", 700: "#16503f" },
        esmeralda: { 400: "#3fc387", 500: "#1f9d63", 600: "#178052" },
        ouro: { 300: "#ecd08a", 400: "#e0b94f", 500: "#d4a83c", 600: "#b88a24" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
