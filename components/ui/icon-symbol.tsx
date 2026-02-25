// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 */
const MAPPING = {
  // Tab icons
  "house.fill": "home",
  "pawprint.fill": "pets",
  "heart.fill": "favorite",
  "person.fill": "person",
  // Navigation icons
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "camera.fill": "camera-alt",
  "photo.fill": "photo",
  "xmark": "close",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.down": "expand-more",
  // Action icons
  "heart": "favorite-border",
  "bubble.left": "chat-bubble-outline",
  "paperplane.fill": "send",
  "trash.fill": "delete",
  "pencil": "edit",
  "checkmark": "check",
  // Feature icons
  "fork.knife": "restaurant",
  "cross.case.fill": "medical-services",
  "calendar": "calendar-today",
  "bell.fill": "notifications",
  "gearshape.fill": "settings",
  "info.circle": "info",
  // Pet world icons
  "tree.fill": "park",
  "house": "home",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "nightlight",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
