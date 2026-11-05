import Colors from './colors';

export const Theme = {
  colors: {
    ...Colors,
    // Aliases for compatibility
    darkGreen: Colors.primaryDark,
    white: '#FFFFFF',
    transparent: 'transparent',
  },
  typography: {
    header: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
      color: Colors.textPrimary,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.2,
      color: Colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: Colors.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      color: Colors.textMuted,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
  shadows: {
    xs: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
    medium: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    elevated: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
};

export default Theme;
