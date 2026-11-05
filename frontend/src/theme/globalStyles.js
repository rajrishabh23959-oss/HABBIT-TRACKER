import { StyleSheet } from 'react-native';
import Colors from './colors';

export const GlobalStyles = StyleSheet.create({
  // Containers
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Typography (Bold, heavy sans-serif headings in #0F332B)
  h1: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: Colors.textDark,
  },
  caption: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Rounded pill badge & button styling (~9999px radius)
  pillButton: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  pillBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },

  // Flex helpers
  row: { flexDirection: 'row', alignItems: 'center' },
  spaceBetween: { justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
});

export default GlobalStyles;
