import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';

const BADGES = [
  { id: '1', emoji: '🔥', title: '7-Day Iron', desc: 'Maintained 7 consecutive days', unlocked: true },
  { id: '2', emoji: '🧘', title: 'Zen Master', desc: 'Resisted 5 cravings with breathing', unlocked: true },
  { id: '3', emoji: '🌱', title: 'Botanist', desc: 'Grew 3 plants to Blooming stage', unlocked: true },
  { id: '4', emoji: '💖', title: 'Kind Soul', desc: 'Completed 5 acts of kindness', unlocked: false },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { data } = useHabitStore();

  const currentXP = user?.xp || 140;
  const currentLevel = user?.level || Math.floor(currentXP / 500) + 1;
  const xpInCurrentLevel = currentXP % 500;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  const totalHabits = data?.habits?.length || 5;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of HabitGame?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 User Profile</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backBtnText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* User Gamer Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user?.name ? user.name.charAt(0) : 'R').toUpperCase()}
            </Text>
            <View style={styles.avatarStarBadge}>
              <Text style={{ fontSize: 12 }}>⭐</Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'Rishab Raj'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'rishab@habitgame.app'}</Text>

          {/* Level Progression */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelRow}>
              <Text style={styles.levelBadgeText}>Level {currentLevel} Consistency Master</Text>
              <Text style={styles.xpText}>{xpInCurrentLevel} / 500 XP</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(8, levelProgressPct)}%` }]} />
            </View>
          </View>
        </View>

        {/* Stats Highlights */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {currentXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>📋 {totalHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🌱 {totalHabits}</Text>
            <Text style={styles.statLabel}>Plants Growing</Text>
          </View>
        </View>

        {/* Badges Cabinet */}
        <Text style={styles.sectionTitle}>Achievement Cabinet</Text>
        <View style={styles.badgesRow}>
          {BADGES.map(b => (
            <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeCardLocked]}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>{b.desc}</Text>
              <View style={[styles.unlockPill, b.unlocked ? styles.unlockedPill : styles.lockedPill]}>
                <Text style={[styles.unlockText, b.unlocked ? styles.unlockedText : styles.lockedText]}>
                  {b.unlocked ? 'Unlocked' : 'Locked'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Notifications', 'Smart reminders are scheduled at 08:00 AM and 08:00 PM!')}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingText}>Daily Reminders</Text>
            <Text style={styles.settingValue}>Active</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Haptics', 'Celebration animations and feedback enabled!')}>
            <Text style={styles.settingIcon}>✨</Text>
            <Text style={styles.settingText}>Haptic & Audio Celebrations</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Export Data', 'Habit and wellness logs ready in JSON format!')}>
            <Text style={styles.settingIcon}>📤</Text>
            <Text style={styles.settingText}>Export Habit Data</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <Text style={styles.settingIcon}>🚪</Text>
            <Text style={[styles.settingText, { color: Colors.red, fontWeight: '800' }]}>Sign Out</Text>
            <Text style={[styles.settingArrow, { color: Colors.red }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
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
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  backBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },

  content: {
    padding: 16,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  avatarStarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },

  levelProgressContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 9999,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 10,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeCardLocked: {
    opacity: 0.5,
    backgroundColor: '#F8FAFC',
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
    minHeight: 28,
  },
  unlockPill: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unlockedPill: {
    backgroundColor: '#D1FAE5',
  },
  lockedPill: {
    backgroundColor: '#E2E8F0',
  },
  unlockText: {
    fontSize: 9,
    fontWeight: '800',
  },
  unlockedText: {
    color: '#065F46',
  },
  lockedText: {
    color: '#64748B',
  },

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  settingArrow: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },
});
