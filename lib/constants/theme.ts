export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export type ThemeOption = typeof THEME_OPTIONS[number];