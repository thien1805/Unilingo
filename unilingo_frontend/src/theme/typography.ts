/**
 * Typography system — Plus Jakarta Sans
 * Font names must match the keys loaded in App.tsx via useFonts()
 */

export const FontFamily = {
  light: 'PlusJakartaSans-Light',
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
};

export const Typography = {
  // Headings
  h1: { fontFamily: FontFamily.extraBold, fontSize: 28, fontWeight: '800' as const, lineHeight: 36 },
  h2: { fontFamily: FontFamily.bold, fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  h4: { fontFamily: FontFamily.semiBold, fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },

  // Body
  body: { fontFamily: FontFamily.regular, fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontFamily: FontFamily.medium, fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  bodySm: { fontFamily: FontFamily.regular, fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },

  // Caption & Labels
  caption: { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  captionSm: { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  label: { fontFamily: FontFamily.semiBold, fontSize: 13, fontWeight: '600' as const, lineHeight: 16 },

  // Buttons
  button: { fontFamily: FontFamily.semiBold, fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  buttonSm: { fontFamily: FontFamily.semiBold, fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },

  // Special
  tabLabel: { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '500' as const, lineHeight: 14 },
  badge: { fontFamily: FontFamily.semiBold, fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: 18, fontWeight: '800' as const, lineHeight: 24 },
  bandScore: { fontFamily: FontFamily.extraBold, fontSize: 36, fontWeight: '900' as const, lineHeight: 42 },
};
