import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Colors from '../../theme/colors';
import Theme from '../../theme/Theme';
import { useAuthStore } from '../../store/useAuthStore';

// Plant growth stages
const PLANT_STAGES = [
  { emoji: '🌱', label: 'Seedling', minStreak: 0 },
  { emoji: '🌿', label: 'Sprout', minStreak: 3 },
  { emoji: '🌳', label: 'Sapling', minStreak: 7 },
  { emoji: '🌲', label: 'Tree', minStreak: 14 },
  { emoji: '🌸', label: 'Blooming!', minStreak: 21 },
];

function getStage(plantLevel) {
  return PLANT_STAGES[Math.min(plantLevel, PLANT_STAGES.length - 1)];
}

function getHealthColor(health) {
  if (health >= 80) return '#10B981';
  if (health >= 50) return '#F59E0B';
  if (health >= 30) return '#F97316';
  return '#EF4444';
}

export default function PlantCard({ habit, onWater }) {
  const { name, emoji, plant_level = 0, plant_streak = 0, plant_health = 100 } = habit;
  const stage = getStage(plant_level);
  const healthColor = getHealthColor(plant_health);
  const addXP = useAuthStore(s => s.addXP);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Gentle floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [plant_health]);

  const handleWaterTap = () => {
    // Pulse animation on water
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.12, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    addXP(5);
    if (onWater) onWater(habit.id);
  };

  const showStars = plant_streak >= 14;

  return (
    <View style={[styles.card, plant_health < 35 && styles.cardWilting]}>
      {/* Top badges row */}
      <View style={styles.topRow}>
        <View style={styles.habitBadge}>
          <Text style={styles.habitBadgeEmoji}>{emoji || '🌿'}</Text>
        </View>

        {showStars && (
          <View style={styles.starsBadge}>
            <Text style={styles.starText}>✨ Master</Text>
          </View>
        )}
      </View>

      {/* Floating Animated Plant */}
      <Animated.View style={[styles.emojiBox, { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] }]}>
        <Text style={styles.plantEmoji}>{stage.emoji}</Text>
      </Animated.View>

      {/* Stage badge */}
      <View style={[styles.stageBadge, { backgroundColor: healthColor + '15' }]}>
        <Text style={[styles.stageName, { color: healthColor }]}>{stage.label}</Text>
      </View>

      {/* Habit name */}
      <Text style={styles.habitName} numberOfLines={2}>{name}</Text>

      {/* Streak badge */}
      <View style={styles.streakRow}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>{plant_streak}d streak</Text>
      </View>

      {/* Health Bar */}
      <View style={styles.healthContainer}>
        <View style={styles.healthBarBg}>
          <View style={[styles.healthBarFill, { width: `${Math.min(100, Math.max(15, plant_health))}%`, backgroundColor: healthColor }]} />
        </View>
        <Text style={[styles.healthStatusText, { color: healthColor }]}>
          {plant_health >= 80 ? '💚 Thriving' : plant_health >= 50 ? '💛 Growing' : '❤️ Needs Water'} ({plant_health}%)
        </Text>
      </View>

      {/* Quick Water Button */}
      <TouchableOpacity
        style={styles.waterBtn}
        onPress={handleWaterTap}
        activeOpacity={0.8}
      >
        <Text style={styles.waterBtnText}>💧 Water (+5 XP)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  cardWilting: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: '#FFFBFB',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitBadgeEmoji: {
    fontSize: 14,
  },
  starsBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  starText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  emojiBox: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  plantEmoji: {
    fontSize: 48,
  },
  stageBadge: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  stageName: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  habitName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    minHeight: 34,
    lineHeight: 17,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  streakIcon: {
    fontSize: 11,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  healthContainer: {
    width: '100%',
    marginVertical: 4,
  },
  healthBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 3,
  },
  healthBarFill: {
    height: 6,
    borderRadius: 9999,
  },
  healthStatusText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  waterBtn: {
    width: '100%',
    backgroundColor: '#E0F2FE',
    borderRadius: Theme.radius.full,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  waterBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
});
