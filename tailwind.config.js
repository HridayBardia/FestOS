/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#FAF8F5",
          cream: "#F4F1EA",
          alabaster: "#FBF9F5",
          card: "#FFFFFF",
          border: "#E5DFD3",
          borderSubtle: "#EFEBE3",
          obsidian: "#1A1A1A",
          charcoal: "#2B2825",
          taupe: "#6B655E",
          taupeLight: "#8F8982",
          gold: "#A3703F",
          goldDark: "#8C6D36",
          goldLight: "#F6EFE6",
          goldMuted: "#C49A6C",
          sage: "#2D5A3E",
          sageLight: "#EAF3EC",
          sageBorder: "#C7E2CE",
          amber: "#7A4E1D",
          amberLight: "#FAF0E4",
          amberBorder: "#EED5BC",
          terracotta: "#7C2D2A",
          terracottaLight: "#FAECEB",
          terracottaBorder: "#F0C9C7",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        luxury: "0 2px 10px rgba(26, 26, 26, 0.04), 0 1px 3px rgba(26, 26, 26, 0.02)",
        luxuryHover: "0 8px 24px rgba(26, 26, 26, 0.06), 0 2px 6px rgba(26, 26, 26, 0.03)",
        card: "0 1px 4px rgba(163, 112, 63, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};

