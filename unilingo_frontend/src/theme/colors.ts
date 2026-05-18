/**
 * Unilingo Color System — Blue Theme
 * Matches the demo HTML design tokens exactly
 */

export const LightColors = {
  bgBody: '#F0F4F8',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F9FC',
  bgCard: '#FFFFFF',
  bgCardHover: '#F0F4F8',
  bgInput: '#F0F4F8',

  accent: '#EACB55',
  accentLight: '#F3D77A',
  accentLighter: '#FFF1B8',
  accentBg: '#FFF7D6',
  accentBg2: '#FDE68A',

  accent2: '#EACB55',
  accent2Bg: '#FFF7D6',
  accent3: '#6366F1',
  accent3Bg: '#EEF2FF',

  rose: '#F43F5E',
  roseBg: '#FFE4E6',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  sky: '#0EA5E9',
  skyBg: '#E0F2FE',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderAccent: '#EACB55',

  tabBarBg: '#FFFFFF',
};

export const DarkColors = {
  bgBody: '#0B1120',
  bgPrimary: '#111827',
  bgSecondary: '#1E293B',
  bgCard: '#1E293B',
  bgCardHover: '#283548',
  bgInput: '#0F172A',

  accent: '#EACB55',
  accentLight: '#F3D77A',
  accentLighter: '#FFF1B8',
  accentBg: '#4A3F1D',
  accentBg2: '#5C4D20',

  accent2: '#EACB55',
  accent2Bg: '#4A3F1D',
  accent3: '#818CF8',
  accent3Bg: '#312E81',

  rose: '#FB7185',
  roseBg: '#4C1D2D',
  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#451A03',
  error: '#F87171',
  errorBg: '#4C1D1D',
  sky: '#38BDF8',
  skyBg: '#0C4A6E',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  border: '#334155',
  borderAccent: '#7C6A2A',

  tabBarBg: '#111827',
};

export const Gradients = {
  primary: ['#EACB55', '#F3D77A', '#FFF1B8'] as const,
  accent: ['#EACB55', '#F3D77A'] as const,
  hero: ['#EACB55', '#F3D77A'] as const,
  rose: ['#F43F5E', '#E11D48'] as const,
  indigo: ['#6366F1', '#818CF8'] as const,
  sky: ['#0EA5E9', '#38BDF8'] as const,
  gold: ['#F59E0B', '#FBBF24'] as const,
  silver: ['#94A3B8', '#CBD5E1'] as const,
  bronze: ['#F97316', '#FB923C'] as const,
};

export type ColorScheme = typeof LightColors;
