/**
 * Color palette for MangaTy application
 */

export const COLORS = {
  // Primary brand colors
  primary: '#D8708E',
  primaryLight: '#F6E9EB',
  pink: '#E91E8C',
  pinkLight: '#F06292',
  pinkDark: '#C2185B',

  // Accent colors
  yellow: '#F5C518',

  // Neutral colors
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textDark: '#1A1A2E',
  textLight: '#888888',
  textMuted: '#888888',
  border: '#F0F0F0',

  // Tag colors by category
  tagColors: {
    Romance: { bg: '#FFD6EC', text: '#C2185B' },
    Drama: { bg: '#D6E4FF', text: '#1565C0' },
    Acción: { bg: '#FFD6D6', text: '#B71C1C' },
    Fantasía: { bg: '#E8D6FF', text: '#6A1B9A' },
    Misterio: { bg: '#D6F0FF', text: '#0277BD' },
    Thriller: { bg: '#FFE8D6', text: '#E65100' },
    Aventura: { bg: '#D6FFE8', text: '#2E7D32' },
  },
} as const;

export type TagCategory = keyof typeof COLORS.tagColors;
