import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#F4F6EE",
          100: "#EEF2E6",
          200: "#D8DCC4",
          300: "#BCC5A0",
          400: "#A3AA82",
          500: "#808A52",
          600: "#636B3E",
          700: "#4A5518",
          800: "#3D4713",
          900: "#2E350E",
        },
        sage: {
          light: "#EEF2E6",
          DEFAULT: "#A3AA82",
          dark: "#4A5518",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
