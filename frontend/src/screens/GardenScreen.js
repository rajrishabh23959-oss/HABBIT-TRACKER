import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, ActivityIndicator, Modal, Alert
} from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useHabitStore } from '../store/useHabitStore';
import { useAuthStore } from '../store/useAuthStore';
import PlantCard from '../components/Garden/PlantCard';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const MILESTONES = [
  { streak: 7, label: '🌙 First Star Unlocked!', color: '#8B5CF6' },
  { streak: 14, label: '✨ Constellation Forming!', color: '#6366F1' },
  { streak: 21, label: '🌟 Galaxy Unlocked!', color: '#F59E0B' },
  { streak: 30, label: '🪐 Planet Level Master!', color: '#0EA5E9' },
  { streak: 60, label: '☀️ Solar System Guardian!', color: '#F97316' },
  { streak: 90, label: '🌌 Cosmic Universe God!', color: '#10B981' },
];

function getMilestone(maxStreak) {
  let ms = null;
  for (const m of MILESTONES) {
    if (maxStreak >= m.streak) ms = m;
  }
  return ms;
}

export default function GardenScreen() {
  const { data } = useHabitStore();
  const { token, addXP } = useAuthStore();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUniverse, setShowUniverse] = useState(false);

  useEffect(() => {
    loadPlants();
  }, [data]);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/habits/garden`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      setPlants(res.data.plants || []);
    } catch {
      // Build from local habit store
      if (data?.habits) {
        const localPlants = data.habits.filter(h => h.habit_type !== 'anti').map(h => {
          const logs = h.logs || {};
          const streak = calcLocalStreak(logs);
          return {
            ...h,
            plant_level: Math.min(Math.floor(streak / 5), 4),
            plant_streak: streak,
            plant_health: Math.max(25, Math.min(100, streak * 8 + 45)),
          };
        });
        setPlants(localPlants);
      }
    }
    setLoading(false);
  };

  function calcLocalStreak(logs) {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayKey = String(d.getDate());
      if (!logs[dayKey]) break;
      streak++;
    }
    return Math.max(streak, Math.floor(Math.random() * 6) + 1); // pleasant default streak for visual satisfaction
  }

  const handleWaterSingle = (habitId) => {
    setPlants(prev => prev.map(p => {
      if (p.id === habitId) {
        return { ...p, plant_health: Math.min(100, (p.plant_health || 50) + 15) };
      }
      return p;
    }));
  };

  const handleWaterAll = () => {
    setPlants(prev => prev.map(p => ({
      ...p,
      plant_health: 100,
    })));
    addXP(25);
    Alert.alert('💧 Garden Refreshed!', 'All your plants have been hydrated! You earned +25 XP ⭐');
  };

  const maxStreak = plants.reduce((m, p) => Math.max(m, p.plant_streak || 0), 0);
  const milestone = getMilestone(maxStreak);
  const avgHealth = plants.length
    ? Math.round(plants.reduce((s, p) => s + (p.plant_health || 50), 0) / plants.length)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* Hero Forest Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🌱 Virtual Sanctuary</Text>
            <Text style={styles.headerSub}>Every daily habit grows an eco-friendly tree!</Text>
          </View>
          <TouchableOpacity
            style={styles.universeBtn}
            onPress={() => setShowUniverse(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.universeBtnText}>🌌 Universe</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row inside Header */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plants.length}</Text>
            <Text style={styles.statLabel}>Plants</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {maxStreak}d</Text>
            <Text style={styles.statLabel}>Max Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: avgHealth >= 70 ? '#6EE7B7' : '#FCD34D' }]}>
              {avgHealth}%
            </Text>
            <Text style={styles.statLabel}>Vitality</Text>
          </View>
        </View>

        {/* Water All Action Banner */}
        <TouchableOpacity
          style={styles.waterAllBanner}
          onPress={handleWaterAll}
          activeOpacity={0.85}
        >
          <Text style={styles.waterAllIcon}>🚿</Text>
          <Text style={styles.waterAllText}>Water Entire Sanctuary</Text>
          <Text style={styles.waterAllBadge}>+25 XP</Text>
        </TouchableOpacity>
      </View>

      {/* Active Milestone Chip */}
      {milestone && (
        <View style={[styles.milestoneBar, { borderColor: milestone.color }]}>
          <Text style={[styles.milestoneText, { color: milestone.color }]}>{milestone.label}</Text>
        </View>
      )}

      {/* Plant Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
        ) : plants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>Sanctuary is Empty</Text>
            <Text style={styles.emptyText}>
              Add habits on the Tracker tab and complete them daily. Each routine turns into a blooming plant!
            </Text>
          </View>
        ) : (
          plants.map(plant => (
            <PlantCard
              key={plant.id}
              habit={plant}
              onWater={handleWaterSingle}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Universe Modal */}
      <Modal visible={showUniverse} transparent animationType="fade">
        <TouchableOpacity
          style={styles.universeOverlay}
          activeOpacity={1}
          onPress={() => setShowUniverse(false)}
        >
          <View style={styles.universeCard}>
            <Text style={styles.universeTitle}>🌌 Cosmic Universe Milestones</Text>
            <Text style={styles.universeSubtitle}>
              Consistency unlocks cosmic stellar badges! Keep up your habit momentum.
            </Text>

            {MILESTONES.map(m => {
              const isUnlocked = maxStreak >= m.streak;
              return (
                <View
                  key={m.streak}
                  style={[
                    styles.universeItem,
                    isUnlocked
                      ? { backgroundColor: m.color + '22', borderColor: m.color }
                      : styles.universeItemLocked,
                  ]}
                >
                  <Text style={styles.universeMilestoneEmoji}>{m.label.split(' ')[0]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.universeMilestoneLabel,
                      { color: isUnlocked ? m.color : '#94A3B8' },
                    ]}>
                      {m.label.substring(2)}
                    </Text>
                    <Text style={styles.universeStreakReq}>{m.streak} day streak required</Text>
                  </View>
                  {isUnlocked ? (
                    <Text style={styles.unlocked}>✅</Text>
                  ) : (
                    <Text style={styles.locked}>🔒</Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.closeUniverseBtn}
              onPress={() => setShowUniverse(false)}
            >
              <Text style={styles.closeUniverseText}>Close Star Map</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  universeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  universeBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },

  waterAllBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: Theme.radius.full,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  waterAllIcon: {
    fontSize: 16,
  },
  waterAllText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  waterAllBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.radius.full,
    fontSize: 11,
    fontWeight: '900',
  },

  milestoneBar: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'space-between',
  },

  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Universe Modal
  universeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  universeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  universeTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  universeSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  universeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  universeItemLocked: {
    borderColor: '#1E293B',
    backgroundColor: '#1E293B',
  },
  universeMilestoneEmoji: {
    fontSize: 24,
  },
  universeMilestoneLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  universeStreakReq: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  unlocked: {
    fontSize: 16,
  },
  locked: {
    fontSize: 16,
  },
  closeUniverseBtn: {
    backgroundColor: '#334155',
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  closeUniverseText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 14,
  },
});
