import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Animated
} from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useHabitStore } from '../store/useHabitStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMoodStore } from '../store/useMoodStore';
import HabitGrid from '../components/Grid/HabitGrid';
import ManageHabitsModal from '../components/Modals/ManageHabitsModal';
import HabitStackModal from '../components/Modals/HabitStackModal';
import MoodModal from '../components/Modals/MoodModal';
import { getToday } from '../utils/dateHelper';
import { XP_PER_CHECKBOX } from '../constants';

const CATEGORIES = [
  { id: 'all', name: 'All Habits', icon: '🌟' },
  { id: 'health', name: 'Health', icon: '❤️' },
  { id: 'mind', name: 'Mind', icon: '🧠' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DashboardScreen({ navigation }) {
  const { data, toggleLog, setWellness } = useHabitStore();
  const { user, addXP } = useAuthStore();
  const { currentMood } = useMoodStore();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'grid'
  const [showManageModal, setShowManageModal] = useState(false);
  const [showStackModal, setShowStackModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const today = getToday();
  const todayNum = today.day;
  const habits = data?.habits || [];

  // Filter habits by category keyword or tag
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    const lower = selectedCategory.toLowerCase();
    return habits.filter(h => {
      const name = h.name.toLowerCase();
      if (lower === 'health') return name.includes('water') || name.includes('sleep') || name.includes('shower') || name.includes('diet') || name.includes('alcohol');
      if (lower === 'mind') return name.includes('meditation') || name.includes('read') || name.includes('plan') || name.includes('journal') || name.includes('detox');
      if (lower === 'fitness') return name.includes('gym') || name.includes('stretch') || name.includes('run') || name.includes('walk') || name.includes('workout');
      if (lower === 'productivity') return name.includes('wake') || name.includes('work') || name.includes('plan') || name.includes('code') || name.includes('focus');
      return true;
    });
  }, [habits, selectedCategory]);

  // Today's completion stats
  const todayCompletedCount = useMemo(() => {
    return habits.filter(h => !!h.logs?.[String(todayNum)]).length;
  }, [habits, todayNum]);

  const totalHabitsCount = habits.length;
  const todayProgressPercent = totalHabitsCount === 0 ? 0 : Math.round((todayCompletedCount / totalHabitsCount) * 100);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleToggleHabit = (habitId, day) => {
    const habit = habits.find(h => h.id === habitId);
    const wasCompleted = !!habit?.logs?.[String(day)];
    toggleLog(habitId, day);
    if (!wasCompleted) {
      addXP(XP_PER_CHECKBOX);
    }
  };

  const formattedDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting}, {user?.name || 'Friend'} ✨</Text>
          <Text style={styles.dateSubtext}>{formattedDate} · Stay consistent</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.xpPill}
            onPress={() => navigation?.navigate?.('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.xpText}>⭐ {user?.xp || 0} XP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation?.navigate?.('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitials}>
              {(user?.name ? user.name.charAt(0) : 'R').toUpperCase()}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user?.level || 1}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Daily Progress Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroTag}>TODAY'S MOMENTUM</Text>
              <Text style={styles.heroTitle}>
                {todayCompletedCount} of {totalHabitsCount} completed
              </Text>
            </View>
            <View style={styles.progressPercentBadge}>
              <Text style={styles.progressPercentText}>{todayProgressPercent}%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.max(5, todayProgressPercent)}%` }]} />
          </View>

          {/* Bottom stats row inside hero card */}
          <View style={styles.heroBottomRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatIcon}>🔥</Text>
              <Text style={styles.heroStatValue}>Streak 7d</Text>
            </View>
            <View style={styles.heroDivider} />
            <TouchableOpacity
              style={styles.heroStatItem}
              onPress={() => setShowMoodModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.heroStatIcon}>
                {currentMood === 'happy' ? '😊' : currentMood === 'energetic' ? '⚡' : currentMood === 'stressed' ? '🧘' : currentMood === 'tired' ? '😴' : '🎭'}
              </Text>
              <Text style={styles.heroStatValue}>
                {currentMood ? `Mood: ${currentMood}` : 'Log Mood +'}
              </Text>
            </TouchableOpacity>
            <View style={styles.heroDivider} />
            <TouchableOpacity
              style={styles.heroStatItem}
              onPress={() => setShowStackModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.heroStatIcon}>🔗</Text>
              <Text style={styles.heroStatValue}>Stack Habit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Switcher: Today's Focus vs Month Grid */}
        <View style={styles.viewSwitcherContainer}>
          <TouchableOpacity
            style={[styles.viewSwitcherBtn, viewMode === 'today' && styles.viewSwitcherBtnActive]}
            onPress={() => setViewMode('today')}
          >
            <Text style={[styles.viewSwitcherText, viewMode === 'today' && styles.viewSwitcherTextActive]}>
              📋 Today's Checklist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewSwitcherBtn, viewMode === 'grid' && styles.viewSwitcherBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.viewSwitcherText, viewMode === 'grid' && styles.viewSwitcherTextActive]}>
              📊 Month Heatmap
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'today' ? (
          <>
            {/* Category Pills */}
            <View style={styles.categoriesSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Habit Cards Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Routine ({filteredHabits.length})</Text>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => setShowManageModal(true)}
              >
                <Text style={styles.manageBtnText}>+ Add / Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Habits List */}
            {filteredHabits.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyTitle}>No habits in this category</Text>
                <Text style={styles.emptySub}>Tap "+ Add / Edit" above to create your routine.</Text>
              </View>
            ) : (
              filteredHabits.map((item, index) => {
                const isTodayDone = !!item.logs?.[String(todayNum)];

                // Calculate recent 7 days completion for the mini rhythm dots
                const recentDots = Array.from({ length: 7 }, (_, i) => {
                  const targetDay = Math.max(1, todayNum - 6 + i);
                  return {
                    dayNum: targetDay,
                    label: WEEK_DAYS[i],
                    isDone: !!item.logs?.[String(targetDay)],
                    isToday: targetDay === todayNum,
                  };
                });

                return (
                  <View key={item.id} style={[styles.habitCard, isTodayDone && styles.habitCardDone]}>
                    <View style={styles.habitCardTop}>
                      <View style={[styles.habitIconWrapper, isTodayDone && styles.habitIconWrapperDone]}>
                        <Text style={styles.habitEmoji}>{item.emoji || '✨'}</Text>
                      </View>

                      <View style={styles.habitTextInfo}>
                        <Text style={[styles.habitName, isTodayDone && styles.habitNameDone]}>
                          {item.name}
                        </Text>
                        <Text style={styles.habitSubtitle}>
                          {item.stack_trigger ? `Trigger: ${item.stack_trigger}` : 'Daily consistency'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.bigCheckBtn, isTodayDone && styles.bigCheckBtnDone]}
                        onPress={() => handleToggleHabit(item.id, todayNum)}
                        activeOpacity={0.8}
                      >
                        {isTodayDone ? (
                          <Text style={styles.bigCheckMark}>✓</Text>
                        ) : (
                          <Text style={styles.bigCheckPlus}>○</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* 7-day rhythm dots */}
                    <View style={styles.dotsRow}>
                      <Text style={styles.rhythmLabel}>Last 7 Days:</Text>
                      <View style={styles.dotsList}>
                        {recentDots.map(dot => (
                          <TouchableOpacity
                            key={dot.dayNum}
                            onPress={() => handleToggleHabit(item.id, dot.dayNum)}
                            style={[
                              styles.miniDot,
                              dot.isDone && styles.miniDotDone,
                              dot.isToday && styles.miniDotToday,
                            ]}
                          >
                            <Text style={[styles.miniDotText, dot.isDone && styles.miniDotTextDone]}>
                              {dot.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          /* Full Month Grid View */
          <View style={styles.gridWrapper}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridMonthTitle}>
                Month: {today.month} / {today.year}
              </Text>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => setShowManageModal(true)}
              >
                <Text style={styles.manageBtnText}>⚙️ Edit Habits</Text>
              </TouchableOpacity>
            </View>

            <HabitGrid
              totalDays={data.totalDays}
              habits={habits}
              wellness={data.wellness}
              onToggle={handleToggleHabit}
              onWellnessChange={setWellness}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      {showManageModal && (
        <ManageHabitsModal onClose={() => setShowManageModal(false)} />
      )}

      {showStackModal && (
        <HabitStackModal
          visible={showStackModal}
          onClose={() => setShowStackModal(false)}
        />
      )}

      {showMoodModal && (
        <MoodModal
          visible={showMoodModal}
          onClose={() => setShowMoodModal(false)}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  dateSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpPill: {
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitials: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  levelText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#064E3B', // Deep rich forest green
    borderRadius: 24,
    padding: 20,
    marginTop: 6,
    marginBottom: 16,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTag: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 3,
  },
  progressPercentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  progressPercentText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 9999,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatIcon: {
    fontSize: 15,
  },
  heroStatValue: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // View switcher
  viewSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: Theme.radius.full,
    padding: 3,
    marginBottom: 16,
  },
  viewSwitcherBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.full,
  },
  viewSwitcherBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  viewSwitcherText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  viewSwitcherTextActive: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Categories
  categoriesSection: {
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  categoryChipIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  manageBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },

  // Habit Card
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitCardDone: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: '#FAFCFA',
  },
  habitCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitIconWrapperDone: {
    backgroundColor: Colors.greenLight,
  },
  habitEmoji: {
    fontSize: 22,
  },
  habitTextInfo: {
    flex: 1,
    paddingRight: 10,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  habitNameDone: {
    color: Colors.textSecondary,
  },
  habitSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  bigCheckBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  bigCheckBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  bigCheckPlus: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  bigCheckMark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  // Dots Row
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  rhythmLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  dotsList: {
    flexDirection: 'row',
    gap: 6,
  },
  miniDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  miniDotDone: {
    backgroundColor: '#10B981',
  },
  miniDotText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  miniDotTextDone: {
    color: '#FFFFFF',
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Month Grid wrapper
  gridWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gridMonthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
