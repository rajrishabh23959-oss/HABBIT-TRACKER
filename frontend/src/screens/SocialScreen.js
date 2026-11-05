import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, TextInput, Animated, Alert
} from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useSocialStore } from '../store/useSocialStore';
import { useAuthStore } from '../store/useAuthStore';

const GOAL_TAGS = ['5 AM Club', 'No Sugar', 'Daily Reading', 'Daily Run', 'No Screen Before 9AM', 'Meditation', 'Deep Work 2h'];

const CATEGORY_COLORS = {
  stranger: { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' },
  family: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  self: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  community: { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
};

export default function SocialScreen() {
  const {
    ghostModeEnabled, partnerContact, partnerName,
    currentGroup, joinedGoalTag,
    setupGhostMode, checkGhostNotification, joinGroup,
    todayChallenge, kindnessCompleted, kindnessStreak,
    loadKindnessChallenge, completeKindness,
  } = useSocialStore();
  const addXP = useAuthStore(s => s.addXP);

  const [activeTab, setActiveTab] = useState('kindness'); // 'kindness' | 'groups' | 'ghost'
  const [contactInput, setContactInput] = useState(partnerContact || '');
  const [nameInput, setNameInput] = useState(partnerName || '');
  const [selectedTag, setSelectedTag] = useState(joinedGoalTag || GOAL_TAGS[0]);
  const [checkMsg, setCheckMsg] = useState(null);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadKindnessChallenge();
    handleJoinGroup(selectedTag);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSetupGhost = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Required', 'Please enter your accountability partner’s name.');
      return;
    }
    await setupGhostMode(contactInput, nameInput, true);
    Alert.alert('👻 Ghost Mode Enabled', `Your accountability partner ${nameInput} is registered!`);
  };

  const handleCheck = async () => {
    const result = await checkGhostNotification();
    setCheckMsg(result);
  };

  const handleJoinGroup = async (tag) => {
    setSelectedTag(tag);
    await joinGroup(tag, Math.floor(Math.random() * 40) + 55);
  };

  const handleCompleteKindness = async () => {
    addXP(20);
    await completeKindness();
    Alert.alert('💝 Kindness Shared!', 'You earned +20 XP and strengthened your empathy streak! ✨');
  };

  const colorSet = CATEGORY_COLORS[todayChallenge?.category] || CATEGORY_COLORS.community;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4338CA" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤝 Community & Kindness</Text>
        <Text style={styles.headerSub}>Accountability, kindness challenges & healthy momentum</Text>
      </View>

      {/* 3-way Segment Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'kindness' && styles.tabBtnActive]}
          onPress={() => setActiveTab('kindness')}
        >
          <Text style={[styles.tabText, activeTab === 'kindness' && styles.tabTextActive]}>
            💝 Kindness
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'groups' && styles.tabBtnActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            🏆 Leaderboards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ghost' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ghost')}
        >
          <Text style={[styles.tabText, activeTab === 'ghost' && styles.tabTextActive]}>
            👻 Ghost Mode
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── TAB 1: RANDOM ACTS OF KINDNESS ── */}
        {activeTab === 'kindness' && (
          <View>
            {/* Streak Badge */}
            {kindnessStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{kindnessStreak} Day Kindness Streak!</Text>
              </View>
            )}

            {/* Daily Challenge Card */}
            {todayChallenge ? (
              <Animated.View
                style={[
                  styles.challengeCard,
                  { borderColor: colorSet.border, transform: [{ translateY: floatAnim }] }
                ]}
              >
                <View style={[styles.categoryBadge, { backgroundColor: colorSet.bg }]}>
                  <Text style={[styles.categoryText, { color: colorSet.text }]}>
                    {todayChallenge.category?.toUpperCase() || 'DAILY'} CHALLENGE
                  </Text>
                </View>

                <Text style={styles.challengeEmoji}>{todayChallenge.emoji || '💖'}</Text>
                <Text style={styles.challengeText}>{todayChallenge.challenge_text}</Text>

                <Text style={styles.challengeDate}>
                  📅 Today's Micro-Mission · Rewires your empathy circuit
                </Text>

                {!kindnessCompleted ? (
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={handleCompleteKindness}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeBtnText}>✅ I Did This! (+20 XP)</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeTitle}>🎉 Outstanding Kindness!</Text>
                    <Text style={styles.completedBadgeSub}>+20 XP awarded · Kindness changes the world 🌍</Text>
                  </View>
                )}
              </Animated.View>
            ) : (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingText}>💝 Preparing today's kindness challenge...</Text>
              </View>
            )}

            {/* Neuroscience Card */}
            <View style={styles.scienceCard}>
              <Text style={styles.scienceTitle}>🧠 The Dopamine-Oxytocin Loop</Text>
              <Text style={styles.scienceText}>
                Studies prove that performing unexpected kindness releases oxytocin and serotonin in the brain, lowering blood pressure and boosting mood throughout the entire day.
              </Text>
            </View>
          </View>
        )}

        {/* ── TAB 2: ANONYMOUS GROUPS & LEADERBOARDS ── */}
        {activeTab === 'groups' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Choose Your Goal Tribe</Text>
              <Text style={styles.cardDesc}>
                Join 10 anonymous peers working towards the exact same habit. Zero personal data shared—only pure consistency percentage!
              </Text>

              <View style={styles.tagsGrid}>
                {GOAL_TAGS.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagBtn, isSelected && styles.tagBtnActive]}
                      onPress={() => handleJoinGroup(tag)}
                    >
                      <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {currentGroup && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🏆 {currentGroup.goal_tag} Leaderboard</Text>
                <Text style={styles.cardDesc}>
                  Live cohort progress · Ranked by 7-day consistency
                </Text>

                {currentGroup.members?.map((m, i) => {
                  const isYou = m.rank === currentGroup.your_rank;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.leaderboardRow,
                        isYou && styles.leaderboardRowYou,
                      ]}
                    >
                      <Text style={styles.rankEmoji}>
                        {m.rank === 1 ? '🥇' : m.rank === 2 ? '🥈' : m.rank === 3 ? '🥉' : `#${m.rank}`}
                      </Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${m.progress_pct}%` }]} />
                      </View>
                      <Text style={styles.progressPct}>{m.progress_pct}%</Text>
                      {isYou && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youLabel}>YOU</Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                <View style={styles.yourRankBox}>
                  <Text style={styles.yourRankText}>
                    Your Standing: #{currentGroup.your_rank} of {currentGroup.total_members} members
                  </Text>
                  {currentGroup.your_rank <= 3 && (
                    <Text style={styles.topText}>🎉 You're on the podium! Keep the streak alive.</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── TAB 3: GHOST MODE ACCOUNTABILITY ── */}
        {activeTab === 'ghost' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👻 Ghost Mode Partner</Text>
              <Text style={styles.cardDesc}>
                Set up a trusted friend or mentor. If you miss your core routine, HabitGame generates a playful accountability alert for them.
              </Text>

              <Text style={styles.inputLabel}>Partner Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex, Priya, Dad..."
                placeholderTextColor={Colors.textMuted}
                value={nameInput}
                onChangeText={setNameInput}
              />

              <Text style={styles.inputLabel}>Partner WhatsApp / Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +1 555-0199 or +91 98765 43210"
                placeholderTextColor={Colors.textMuted}
                value={contactInput}
                onChangeText={setContactInput}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#4338CA' }]}
                onPress={handleSetupGhost}
              >
                <Text style={styles.btnText}>
                  {ghostModeEnabled ? '✅ Ghost Mode Configured!' : '👻 Activate Ghost Mode'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Test alert status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📬 Accountability Preview</Text>
              <Text style={styles.cardDesc}>
                Preview what message your partner would receive if you missed today's habits.
              </Text>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4F46E5' }]} onPress={handleCheck}>
                <Text style={styles.btnText}>🔍 Check Status Now</Text>
              </TouchableOpacity>

              {checkMsg && (
                <View style={[
                  styles.ghostMsgBox,
                  { borderColor: checkMsg.should_notify ? '#EF4444' : '#10B981' },
                ]}>
                  <Text style={styles.ghostMsgTitle}>
                    {checkMsg.should_notify ? '🚨 Warning Generated:' : '✅ Habits on Track!'}
                  </Text>
                  <Text style={styles.ghostMsg}>{checkMsg.message}</Text>
                  {checkMsg.should_notify && (
                    <Text style={styles.ghostNote}>
                      👆 Tap and copy to send via WhatsApp or SMS to your partner!
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#4338CA',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    padding: 4,
    margin: 16,
    borderRadius: Theme.radius.full,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.full,
  },
  tabBtnActive: {
    backgroundColor: '#4338CA',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  content: {
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    marginBottom: 6,
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
  btn: {
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },

  ghostMsgBox: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
  },
  ghostMsgTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  ghostMsg: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ghostNote: {
    marginTop: 8,
    fontSize: 11,
    color: '#4338CA',
    fontWeight: '700',
  },

  // Groups
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagBtnActive: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: '#FFF',
  },

  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  leaderboardRowYou: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: -18,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  rankEmoji: {
    fontSize: 16,
    width: 32,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4338CA',
    borderRadius: 9999,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    width: 44,
    textAlign: 'right',
  },
  youBadge: {
    backgroundColor: '#4338CA',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },

  yourRankBox: {
    marginTop: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  yourRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4338CA',
  },
  topText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 3,
  },

  // Kindness tab
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: Theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 16,
    gap: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    color: '#B45309',
    fontWeight: '900',
    fontSize: 13,
  },

  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  categoryBadge: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  challengeEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  challengeText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  challengeDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 20,
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: '#4338CA',
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  completeBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
    width: '100%',
  },
  completedBadgeTitle: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 14,
  },
  completedBadgeSub: {
    color: '#15803D',
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
  },
  loadingCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  scienceCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scienceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
    marginBottom: 6,
  },
  scienceText: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
});
