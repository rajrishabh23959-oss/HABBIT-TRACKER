/**
 * Feature #10: Paper/Journal UI Theme
 * A warm, parchment-style color palette for the "Minimalist Paper" mode.
 */

export const PaperTheme = {
  // Warm parchment base
  background: '#FDF6E3',
  surface: '#F5ECD7',
  card: '#FFFDF5',
  border: '#D4C5A9',

  // Ink colors
  textPrimary: '#2C1810',    // dark brown ink
  textDark: '#4A2F20',       // medium brown
  textMuted: '#8B7355',      // faded ink
  textLight: '#C4A882',      // light sepia

  // Accent - pen ink colors
  accent: '#1A4A6B',         // navy ink
  accentGreen: '#2E5C2E',    // forest ink
  accentRed: '#8B1A1A',      // red pen
  accentOrange: '#8B4513',   // russet

  // Overlays
  overlay: 'rgba(44, 24, 16, 0.5)',
};

// Paper texture styles (CSS-like patterns using RN shadow/border tricks)
export const paperStyles = {
  paperCard: {
    backgroundColor: '#FDF6E3',
    borderRadius: 4,
    shadowColor: '#4A2F20',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  paperHeader: {
    backgroundColor: '#2C1810',
    borderBottomWidth: 2,
    borderBottomColor: '#1A4A6B',
  },
  paperInput: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#D4C5A9',
    borderRadius: 2,
  },
  paperButton: {
    backgroundColor: '#2C1810',
    borderRadius: 2,
  },
  // Ruled lines effect using border tricks
  ruledLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
    borderStyle: 'dashed',
  },
};

export default PaperTheme;
