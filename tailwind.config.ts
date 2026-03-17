import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1120",
        panel: "#111827",
        muted: "#1f2937",
        accent: "#14b8a6",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(2, 6, 23, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
