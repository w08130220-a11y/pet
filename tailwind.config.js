const { themeColors } = require("./theme.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: themeColors.primary,
        secondary: themeColors.secondary,
        background: themeColors.background,
        surface: themeColors.surface,
        foreground: themeColors.foreground,
        muted: themeColors.muted,
        border: themeColors.border,
        success: themeColors.success,
        warning: themeColors.warning,
        error: themeColors.error,
      },
    },
  },
  plugins: [],
};
