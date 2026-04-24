/**
 * Unilingo Color System — Teal Emerald 🌿
 * Matches the demo HTML design tokens exactly
 */

export const LightColors = {
  bgBody: '#F0F4F8',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F9FC',
  bgCard: '#FFFFFF',
  bgCardHover: '#F0F4F8',
  bgInput: '#F0F4F8',

  accent: '#0D9488',
  accentLight: '#14B8A6',
  accentLighter: '#99F6E4',
  accentBg: 'rgba(13,148,136,0.08)',
  accentBg2: 'rgba(13,148,136,0.12)',

  accent2: '#F59E0B',
  accent2Bg: 'rgba(245,158,11,0.10)',
  accent3: '#6366F1',
  accent3Bg: 'rgba(99,102,241,0.08)',

  rose: '#F43F5E',
  roseBg: 'rgba(244,63,94,0.08)',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.10)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.10)',
  error: '#EF4444',
  errorBg: 'rgba(239,68,68,0.08)',
  sky: '#0EA5E9',
  skyBg: 'rgba(14,165,233,0.08)',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  border: 'rgba(15,23,42,0.08)',
  borderAccent: 'rgba(13,148,136,0.25)',

  tabBarBg: 'rgba(255,255,255,0.92)',
};

export const DarkColors = {
  bgBody: '#0B1120',
  bgPrimary: '#111827',
  bgSecondary: '#1E293B',
  bgCard: '#1E293B',
  bgCardHover: '#283548',
  bgInput: '#0F172A',

  accent: '#14B8A6',
  accentLight: '#2DD4BF',
  accentLighter: '#5EEAD4',
  accentBg: 'rgba(20,184,166,0.12)',
  accentBg2: 'rgba(20,184,166,0.18)',

  accent2: '#FBBF24',
  accent2Bg: 'rgba(251,191,36,0.12)',
  accent3: '#818CF8',
  accent3Bg: 'rgba(129,140,248,0.12)',

  rose: '#FB7185',
  roseBg: 'rgba(251,113,133,0.12)',
  success: '#34D399',
  successBg: 'rgba(52,211,153,0.12)',
  warning: '#FBBF24',
  warningBg: 'rgba(251,191,36,0.12)',
  error: '#F87171',
  errorBg: 'rgba(248,113,113,0.12)',
  sky: '#38BDF8',
  skyBg: 'rgba(56,189,248,0.12)',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  border: 'rgba(241,245,249,0.08)',
  borderAccent: 'rgba(20,184,166,0.30)',

  tabBarBg: 'rgba(17,24,39,0.92)',
};

export const Gradients = {
  primary: ['#0D9488', '#14B8A6', '#2DD4BF'] as const,
  accent: ['#F59E0B', '#FBBF24'] as const,
  hero: ['#0D9488', '#0F766E'] as const,
  rose: ['#F43F5E', '#E11D48'] as const,
  indigo: ['#6366F1', '#818CF8'] as const,
  sky: ['#0EA5E9', '#38BDF8'] as const,
  gold: ['#F59E0B', '#FBBF24'] as const,
  silver: ['#94A3B8', '#CBD5E1'] as const,
  bronze: ['#F97316', '#FB923C'] as const,
};

export type ColorScheme = typeof LightColors;
