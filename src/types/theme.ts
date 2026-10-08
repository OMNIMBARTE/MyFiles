export type ThemeId =
  | 'classic-dark'
  | 'dark-glow'
  | 'midnight'
  | 'aurora'
  | 'cyber'
  | 'glass'
  | 'monochrome'
  | 'solar'
  | 'forest'
  | 'ocean';

export interface ThemeColors {
  bgBase: string;
  bgSurface: string;
  bgCard: string;
  bgHover: string;
  bgActive: string;
  border: string;
  borderHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSubtle: string;
  accentGlow: string;
  glow: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  backgroundStyle: 'mesh' | 'gradient' | 'glass' | 'cyber-grid' | 'aurora' | 'deep' | 'solid';
  previewPalette: [string, string, string, string]; // 4 accent/bg swatches
  colors: ThemeColors;
}
