import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColors } from "@/hooks/use-colors";

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: Edge[];
  containerClassName?: string;
}

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  containerClassName,
}: ScreenContainerProps) {
  const colors = useColors();

  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: colors.background }}
      className={containerClassName}
    >
      <StatusBar style="auto" />
      {children}
    </SafeAreaView>
  );
}
