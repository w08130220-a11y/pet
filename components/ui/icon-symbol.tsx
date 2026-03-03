import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "calendar": "calendar-today",
  "storefront.fill": "storefront",
  "person.fill": "person",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.down": "expand-more",
  "xmark": "close",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "mappin.and.ellipse": "place",
  "map.fill": "map",
  "heart": "favorite-border",
  "heart.fill": "favorite",
  "star.fill": "star",
  "star": "star-border",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "clock": "schedule",
  "clock.fill": "schedule",
  "phone.fill": "phone",
  "pencil": "edit",
  "trash.fill": "delete",
  "dollarsign.circle": "attach-money",
  "creditcard.fill": "credit-card",
  "bell.fill": "notifications",
  "gearshape.fill": "settings",
  "info.circle": "info",
  "questionmark.circle": "help",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "camera.fill": "camera-alt",
  "photo.fill": "photo",
  "paperplane.fill": "send",
  "bubble.left": "chat-bubble-outline",
} as IconMapping;

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
