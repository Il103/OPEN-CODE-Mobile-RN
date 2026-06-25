export const Colors = {
  dark: {
    bg: '#0a0a1a',
    glassBg: 'rgba(255,255,255,0.06)',
    glassBorder: 'rgba(255,255,255,0.1)',
    glassShadow: 'rgba(0,0,0,0.3)',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.6)',
    accent: '#6c5ce7',
    accent2: '#00cec9',
    accent3: '#fd79a8',
    accentGlow: 'rgba(108,92,231,0.4)',
    userBubble: 'rgba(108,92,231,0.25)',
    aiBubble: 'rgba(255,255,255,0.06)',
    tabBar: 'rgba(10,10,26,0.92)',
    cardBg: 'rgba(255,255,255,0.04)',
    inputBg: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#f0f0f8',
    glassBg: 'rgba(255,255,255,0.5)',
    glassBorder: 'rgba(255,255,255,0.6)',
    glassShadow: 'rgba(0,0,0,0.08)',
    text: '#1a1a2e',
    textSecondary: 'rgba(26,26,46,0.5)',
    accent: '#6c5ce7',
    accent2: '#00cec9',
    accent3: '#fd79a8',
    accentGlow: 'rgba(108,92,231,0.2)',
    userBubble: 'rgba(108,92,231,0.15)',
    aiBubble: 'rgba(255,255,255,0.7)',
    tabBar: 'rgba(240,240,248,0.92)',
    cardBg: 'rgba(255,255,255,0.6)',
    inputBg: 'rgba(255,255,255,0.6)',
  },
  ocean: {
    bg: '#03045e',
    glassBg: 'rgba(0,150,200,0.1)',
    glassBorder: 'rgba(0,200,255,0.15)',
    glassShadow: 'rgba(0,0,0,0.3)',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.6)',
    accent: '#00b4d8',
    accent2: '#48cae4',
    accent3: '#90e0ef',
    accentGlow: 'rgba(0,180,216,0.4)',
    userBubble: 'rgba(0,180,216,0.2)',
    aiBubble: 'rgba(255,255,255,0.04)',
    tabBar: 'rgba(3,4,94,0.92)',
    cardBg: 'rgba(0,150,200,0.05)',
    inputBg: 'rgba(255,255,255,0.04)',
  },
} as const;

export type ThemeName = keyof typeof Colors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  title: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  round: 999,
} as const;
