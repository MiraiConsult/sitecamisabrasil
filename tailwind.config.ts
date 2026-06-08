import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brasil: {
          green: "#009C3B",
          greenDark: "#007A2E",
          yellow: "#FFDF00",
          yellowDark: "#F5C518",
          blue: "#002776",
        },
        rr: {
          navy: "#0B2A5B",
          blue: "#1E5BB8",
        },
      },
      fontFamily: {
        display: ["Anton", "Impact", "Haettenschweiler", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
