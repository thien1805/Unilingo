/**
 * Theme store — Zustand-based theme management
 */
import { create } from 'zustand';
import { LightColors, DarkColors, ColorScheme } from '../theme/colors';

interface ThemeState {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  colors: LightColors,
  toggleTheme: () =>
    set((state) => ({
      isDark: !state.isDark,
      colors: state.isDark ? LightColors : DarkColors,
    })),
}));
