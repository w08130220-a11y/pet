import { useColorScheme } from "react-native";

const themeColors = {
  primary: { light: "#FF6B6B", dark: "#FF8585" },
  secondary: { light: "#4ECDC4", dark: "#5FDDD4" },
  background: { light: "#FFFFFF", dark: "#1A1A2E" },
  surface: { light: "#F8F9FA", dark: "#252542" },
  foreground: { light: "#2D3436", dark: "#EAEAEA" },
  muted: { light: "#636E72", dark: "#9BA1A6" },
  border: { light: "#E9ECEF", dark: "#3D3D5C" },
  success: { light: "#00B894", dark: "#55EFC4" },
  warning: { light: "#FDCB6E", dark: "#FFE066" },
  error: { light: "#E17055", dark: "#FF7675" },
};

type ThemeMode = "light" | "dark";

function getColors(mode: ThemeMode) {
  return {
    primary: themeColors.primary[mode],
    secondary: themeColors.secondary[mode],
    background: themeColors.background[mode],
    surface: themeColors.surface[mode],
    foreground: themeColors.foreground[mode],
    muted: themeColors.muted[mode],
    border: themeColors.border[mode],
    success: themeColors.success[mode],
    warning: themeColors.warning[mode],
    error: themeColors.error[mode],
  };
}

export function useColors() {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === "dark" ? "dark" : "light";
  return getColors(mode);
}
