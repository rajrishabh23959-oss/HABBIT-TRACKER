import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Animated,
} from 'react-native';
import Colors from '../theme/colors';
import { useSocialStore } from '../store/useSocialStore';

const CATEGORY_COLORS = {
  stranger: { bg: '#E8EAF6', text: '#3F51B5', border: '#7986CB' },
  family: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },
  self: { bg: '#FFF9C4', text: '#F57F17', border: '#FFB300' },
  community: { bg: '#FCE4EC', text: '#C62828', border: '#EF5350' },
};

export default function KindnessScreen() {
  const {
    todayChallenge, kindnessCompleted, kindnessStreak,
    loadKindnessChallenge, completeKindness,
  } = useSocialStore();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadKindnessChallenge();
  }, []);

  useEffect(() => {
    // Gentle floating for the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -5, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleComplete = async () => {
    // Tap animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    // Check animation
    Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    await completeKindness();
  };

  const colorSet = CATEGORY_COLORS[todayChallenge?.category] || CATEGORY_COLORS.community;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#880E4F" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>💝 Random Acts of Kindness</Text>
        <Text style={styles.headerSub}>Aaj duniya ko thoda behtar banao</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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
            style={[styles.challengeCard, { borderColor: colorSet.border, transform: [{ translateY: floatAnim }] }]}
          >
            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
              <Text style={[styles.categoryText, { color: colorSet.text }]}>
                {todayChallenge.category?.charAt(0).toUpperCase() + todayChallenge.category?.slice(1)} Challenge
              </Text>
            </View>

            {/* Challenge emoji */}
            <Text style={styles.challengeEmoji}>{todayChallenge.emoji}</Text>

            {/* Challenge text */}
            <Text style={styles.challengeText}>{todayChallenge.challenge_text}</Text>

            <Text style={styles.challengeDate}>
              📅 Aaj ka challenge — {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long' })}
            </Text>

            {/* Complete Button */}
            {!kindnessCompleted ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                  <Text style={styles.completeBtnText}>✅ Maine Kar Diya!</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View style={[styles.completedBadge, { opacity: checkAnim }]}>
                <Text style={styles.completedText}>🎉 Shandaar! Aaj ka challenge complete!</Text>
                <Text style={styles.completedXP}>+20 XP earned</Text>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>💝 Challenge load ho raha hai...</Text>
          </View>
        )}

        {/* Why this matters */}
        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>🧠 Science says:</Text>
          <Text style={styles.whyText}>
            Ek act of kindness se aapke brain mein dopamine release hoti hai — wahi feeling jo habit complete karne par hoti hai. Kindness aapko khush rakhti hai! 💚
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>✨ Kal ke liye taiyar raho:</Text>
          {[
            { emoji: '🌺', tip: 'Kisi ki compliment sincerely karo' },
            { emoji: '📖', tip: 'Apni learning share karo kisi ke saath' },
            { emoji: '🤲', tip: 'Bina maange kisi ki madad karo' },
            { emoji: '📱', tip: 'Ek positive message bhejo purane dost ko' },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{t.emoji}</Text>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#880E4F' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: '#F48FB1', fontSize: 11, fontWeight: '600', marginTop: 2 },

  content: { padding: 16 },

  streakBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6F00', borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 20,
    marginBottom: 16, gap: 8, alignSelf: 'center',
  },
  streakEmoji: { fontSize: 18 },
  streakText: { color: '#FFF', fontWeight: '900', fontSize: 14 },

  challengeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 16,
    borderWidth: 2, alignItems: 'center',
    shadowColor: '#880E4F', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  categoryBadge: {
    borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1.5, marginBottom: 16,
  },
  categoryText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  challengeEmoji: { fontSize: 72, marginBottom: 16 },
  challengeText: {
    fontSize: 18, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 26, marginBottom: 10,
  },
  challengeDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 24, fontWeight: '600' },

  completeBtn: {
    backgroundColor: '#880E4F', borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 32,
  },
  completeBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },

  completedBadge: {
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#4CAF50',
  },
  completedText: { color: '#2E7D32', fontWeight: '800', fontSize: 14 },
  completedXP: { color: '#4CAF50', fontWeight: '700', fontSize: 12, marginTop: 4 },

  loadingCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 40, alignItems: 'center', marginBottom: 16,
  },
  loadingText: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },

  whyCard: {
    backgroundColor: '#F3E5F5', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#CE93D8',
  },
  whyTitle: { fontSize: 14, fontWeight: '900', color: '#6A1B9A', marginBottom: 8 },
  whyText: { fontSize: 13, color: '#4A148C', lineHeight: 20, fontWeight: '500' },

  tipsCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  tipsTitle: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  tipEmoji: { fontSize: 18, width: 24 },
  tipText: { flex: 1, fontSize: 13, color: Colors.textDark, fontWeight: '600' },
});
