import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../theme/Theme';

export default function SoftCard({ children, style, noPadding = false }) {
  return (
    <View style={[
      styles.card, 
      noPadding && { padding: 0 },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadows.soft,
    marginBottom: Theme.spacing.md,
  },
});
