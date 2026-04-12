/**
 * Typography configuration for MangaTy
 */

export const TYPOGRAPHY = {
  // Font families
  fonts: {
    primary: 'System',
    // Android/iOS will use system fonts by default
    // Web will use 'Nunito' if available via @font-face
  },

  // Font sizes
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 22,
  },

  // Font weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;
