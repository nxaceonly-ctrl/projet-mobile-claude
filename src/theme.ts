// Identité visuelle ASCENDANT : fond bleu nuit dégradé, cartes "verre" arrondies,
// accents bleu → violet, titres encadrés lumineux.
export const colors = {
  bgTop: '#0F1A38',
  bgMid: '#0C1430',
  bgBottom: '#1A1433',
  card: 'rgba(22, 42, 92, 0.38)',
  cardBorder: 'rgba(72, 132, 255, 0.35)',
  tile: 'rgba(10, 16, 34, 0.85)',
  tileBorder: 'rgba(255, 255, 255, 0.06)',
  primary: '#1E7BFF',
  violet: '#5B4FE0',
  glow: '#6FB4FF',
  text: '#EEF3FF',
  textDim: '#8C97B2',
  textFaint: '#5A6480',
  success: '#3DDC97',
  danger: '#FF4D6D',
  dangerBg: 'rgba(120, 24, 44, 0.35)',
  gold: '#E8B44C',
  goldBg: 'rgba(70, 52, 20, 0.55)',
};

export const gradients = {
  bg: [colors.bgTop, colors.bgMid, colors.bgBottom] as const,
  primary: [colors.primary, colors.violet] as const,
  danger: ['#FF4D6D', '#B5305A'] as const,
  success: ['#3DDC97', '#1E9E8A'] as const,
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const radius = { card: 26, tile: 16, pill: 999 };
