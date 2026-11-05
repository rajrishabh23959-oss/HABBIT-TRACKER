import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';

export default function GoalProgressBar({ label, currentStreak, bestStreak, completed, percent }) {
  const safePercent = Math.min(100, Math.max(0, percent || 0));
  const isHigh = safePercent >= 75;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.badge, isHigh ? styles.badgeGreen : styles.badgeSlate]}>
          <Text style={[styles.badgeText, isHigh ? styles.badgeTextGreen : styles.badgeTextSlate]}>
            {safePercent}% Consistency
          </Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <Text style={styles.statText}>🔥 Current: <Text style={styles.statBold}>{currentStreak}d</Text></Text>
        <Text style={styles.statText}>🏆 Best: <Text style={styles.statBold}>{bestStreak}d</Text></Text>
        <Text style={styles.statText}>✅ Done: <Text style={styles.statBold}>{completed}</Text></Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${safePercent}%`, backgroundColor: isHigh ? '#10B981' : '#6366F1' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '800',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeGreen: {
    backgroundColor: '#D1FAE5',
  },
  badgeSlate: {
    backgroundColor: '#EEF2F6',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextGreen: {
    color: '#065F46',
  },
  badgeTextSlate: {
    color: '#475569',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statBold: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
  },
});
