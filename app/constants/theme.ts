import { Platform } from 'react-native';

export const Colors = {
  primary: '#4338ca', // Deep Indigo (Premium)
  pastelBlue: '#cadbfc',
  pastelPink: '#feecf5',
  pastelLavender: '#f9eafe',
  pastelOrchid: '#ebbcfc',

  light: {
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    background: '#f8f9ff',
    surface: '#ffffff',
    surfaceAlt: '#f0f2ff',
    tint: '#ff0061',
    icon: '#8b8fa3',
    tabIconDefault: '#8b8fa3',
    tabIconSelected: '#ff0061',
    border: '#e8eaf0',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  dark: {
    text: '#f0f0f5',
    textSecondary: '#9ca3af',
    background: '#0f0f1a',
    surface: '#1a1a2e',
    surfaceAlt: '#252540',
    tint: '#ff0061',
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#ff0061',
    border: '#2a2a40',
    success: '#22c55e',
    warning: '#f59e0b',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
