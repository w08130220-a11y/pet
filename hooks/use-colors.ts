import { useColorScheme } from 'react-native';
const { themeColors } = require('@/theme.config');

type ColorKey = keyof typeof themeColors;

export function useColors() {
  const scheme = useColorScheme() ?? 'light';
  const mode = scheme === 'dark' ? 'dark' : 'light';

  const colors: Record<ColorKey, string> = {} as any;
  for (const key of Object.keys(themeColors) as ColorKey[]) {
    colors[key] = themeColors[key][mode];
  }
  return colors;
}
