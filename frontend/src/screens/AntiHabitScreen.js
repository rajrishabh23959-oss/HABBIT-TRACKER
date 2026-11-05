import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, TextInput, Alert, Animated,
} from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useAntiHabitStore } from '../store/useAntiHabitStore';
import { useAuthStore } from '../store/useAuthStore';
import BreathingAnimation from '../components/Common/BreathingAnimation';

export default function AntiHabitScreen() {
  const {
    antiHabits, loadAntiHabits, createAntiHabit, deleteAntiHabit,
    urgeTimerActive, timerSeconds, breathingPhase,
    startUrgeTimer, tickTimer, completeBreathing, stats,
  } = useAntiHabitStore();
  const addXP = useAuthStore(s => s.addXP);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🚫');
  const timerRef = useRef(null);

  useEffect(() => {
    loadAntiHabits();
  }, []);

  // Timer tick
  useEffect(() => {
    if (urgeTimerActive) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [urgeTimerActive]);

  // Auto-complete when timer reaches 0
  useEffect(() => {
    if (urgeTimerActive && timerSeconds === 0) {
      handleTimerComplete();
    }
  }, [timerSeconds]);

  const handleTimerComplete = () => {
    addXP(30);
    Alert.alert(
      '🎉 Incredible Strength!',
      'You rode the urge wave for 60 seconds! Craving intensity drops by 90% after 1 minute.',
      [
        { text: '✅ I Resisted (+30 XP)', onPress: () => completeBreathing(true) },
        { text: '😔 Slipped (Still growing)', onPress: () => completeBreathing(false) },
      ],
    );
  };

  const handleUrgePress = (habitId) => {
    startUrgeTimer(habitId);
  };

  const handleAddHabit = async () => {
    if (!newName.trim()) return;
    await createAntiHabit(newName, newEmoji);
    setNewName('');
    setNewEmoji('🚫');
    setShowAddForm(false);
  };

  const confirmDelete = (habitId, name) => {
    Alert.alert(
      'Delete Anti-Habit',
      `Stop tracking "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAntiHabit(habitId) },
      ]
    );
  };

  const ANTI_HABIT_EMOJIS = ['🚫', '📱', '🍔', '🚬', '🍺', '🎮', '☕', '🍭', '🛋️', '⏰'];

  // Urge timer full-screen zen mode
  if (urgeTimerActive) {
    return (
      <SafeAreaView style={styles.timerScreen}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.timerHeader}>
          <Text style={styles.timerHeaderTitle}>🛡️ Zen Urge Surfing</Text>
          <Text style={styles.timerHeaderSub}>Take slow, rhythmic breaths. Ride the impulse wave.</Text>
        </View>

        <View style={styles.timerContent}>
          <BreathingAnimation phase={breathingPhase} timerSeconds={timerSeconds} />

          <View style={styles.timerTips}>
            <Text style={styles.tipTitle}>💡 Neurobiology of Urges:</Text>
            <Text style={styles.tipItem}>• Physical cravings crest like ocean waves and fade in 90s</Text>
            <Text style={styles.tipItem}>• You are not your craving — observe it without judgment</Text>
            <Text style={styles.tipItem}>• Every resisted urge physically rewires your neural pathways</Text>
          </View>

          <View style={styles.timerActions}>
            <TouchableOpacity
              style={styles.resistedBtn}
              onPress={() => {
                addXP(30);
                completeBreathing(true);
              }}
            >
              <Text style={styles.resistedBtnText}>✅ I Resisted! (+30 XP)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slipBtn}
              onPress={() => completeBreathing(false)}
            >
              <Text style={styles.slipBtnText}>😔 I Slipped</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.compassionText}>
            Compassion Rule: A slip is never a failure. Your progress and neuroplasticity remain intact! 💚
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate total resisted vs slips
  const totalAntiHabits = antiHabits.length || 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛡️ Anti-Habit Shield</Text>
          <Text style={styles.headerSub}>Break unwanted vices with urge-surfing neuroscience</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
          <Text style={styles.addBtnText}>{showAddForm ? '✕ Close' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Science Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>🌊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Urge Surfing Philosophy</Text>
            <Text style={styles.infoText}>
              When a craving hits, tap "I Feel The Urge". 60 seconds of 4-4-4 box breathing drops cortisol and reduces craving intensity by 90%.
            </Text>
          </View>
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Habit to Break</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Doomscrolling, Late Night Snacking, Procrastination..."
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.emojiLabel}>Choose Icon:</Text>
            <View style={styles.emojiRow}>
              {ANTI_HABIT_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnActive]}
                  onPress={() => setNewEmoji(e)}
                >
                  <Text style={styles.emojiBtnText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddHabit}>
              <Text style={styles.saveBtnText}>Save Anti-Habit 🛡️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Anti-habits list */}
        {antiHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No Anti-Habits Tracked Yet</Text>
            <Text style={styles.emptyText}>
              Tap "+ Add" to begin breaking unwanted vices (e.g. screen addiction, sugar, procrastination).
            </Text>
          </View>
        ) : (
          antiHabits.map(habit => {
            const habitStats = stats[habit.id] || {};
            const todaySlips = habitStats.today_slips || 0;
            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitRow}>
                  <View style={styles.habitEmojiBox}>
                    <Text style={styles.habitEmoji}>{habit.emoji || '🚫'}</Text>
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitMeta}>
                      Today's slips: <Text style={{ color: todaySlips > 0 ? '#EF4444' : '#10B981', fontWeight: '800' }}>{todaySlips}</Text> · Streak protected
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(habit.id, habit.name)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* THE URGE BUTTON */}
                <TouchableOpacity
                  style={styles.urgeBtn}
                  onPress={() => handleUrgePress(habit.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.urgeInnerRow}>
                    <Text style={styles.urgeBtnEmoji}>😤</Text>
                    <View>
                      <Text style={styles.urgeBtnText}>I Feel The Urge!</Text>
                      <Text style={styles.urgeBtnSub}>Start 60-second guided breathing reset</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },

  content: {
    padding: 16,
  },

  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoEmoji: {
    fontSize: 28,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  emojiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  emojiBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emojiBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emojiBtnText: {
    fontSize: 20,
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  habitEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmoji: {
    fontSize: 22,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  habitMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 16,
  },

  urgeBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  urgeInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgeBtnEmoji: {
    fontSize: 28,
  },
  urgeBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#991B1B',
  },
  urgeBtnSub: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 1,
    fontWeight: '600',
  },

  // Full Screen Timer
  timerScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  timerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  timerHeaderTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  timerHeaderSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  timerTips: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  tipItem: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
  timerActions: {
    width: '100%',
    gap: 10,
    marginTop: 24,
  },
  resistedBtn: {
    backgroundColor: '#10B981',
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resistedBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
  },
  slipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  slipBtnText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
  },
  compassionText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
