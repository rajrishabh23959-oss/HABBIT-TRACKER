import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import Colors from '../../theme/colors';
import { useMoodStore } from '../../store/useMoodStore';

const MOODS = [
  { key: 'energetic', label: 'Energetic', emoji: '⚡', color: '#FF9800', bg: '#FFF3E0' },
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#4CAF50', bg: '#E8F5E9' },
  { key: 'tired', label: 'Tired', emoji: '😴', color: '#9C27B0', bg: '#F3E5F5' },
  { key: 'stressed', label: 'Stressed', emoji: '😰', color: '#F44336', bg: '#FFEBEE' },
];

export default function MoodModal({ visible, onClose }) {
  const { checkIn, currentMood, suggestions, moodMessage, motivationalQuote, loading } = useMoodStore();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedMood, setSelectedMood] = React.useState(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      setSelectedMood(null);
      setShowSuggestions(false);
    }
  }, [visible]);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.key);
    await checkIn(mood.key);
    setShowSuggestions(true);
  };

  const selectedMoodConfig = MOODS.find(m => m.key === selectedMood);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {!showSuggestions ? (
              <>
                {/* Header */}
                <Text style={styles.greeting}>🌅 Namaste!</Text>
                <Text style={styles.question}>Aaj aap kaisa feel kar rahe hain?</Text>
                <Text style={styles.subtext}>
                  App aapki energy ke hisaab se habits adjust karegi
                </Text>

                {/* Mood Grid */}
                <View style={styles.moodGrid}>
                  {MOODS.map(mood => (
                    <TouchableOpacity
                      key={mood.key}
                      style={[styles.moodCard, { backgroundColor: mood.bg, borderColor: mood.color }]}
                      onPress={() => handleMoodSelect(mood)}
                      disabled={loading}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {loading && (
                  <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
                )}

                <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
                  <Text style={styles.skipText}>Skip for now →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Suggestions View */}
                <View style={[styles.moodBadge, { backgroundColor: selectedMoodConfig?.bg }]}>
                  <Text style={styles.moodBadgeEmoji}>{selectedMoodConfig?.emoji}</Text>
                  <Text style={[styles.moodBadgeLabel, { color: selectedMoodConfig?.color }]}>
                    {selectedMoodConfig?.label} Mode
                  </Text>
                </View>

                <Text style={styles.moodMessage}>{moodMessage}</Text>

                <Text style={styles.suggestionsTitle}>✨ Aaj ke liye special habits:</Text>

                {suggestions.map((s, i) => (
                  <View key={i} style={styles.suggestionCard}>
                    <Text style={styles.suggestionEmoji}>{s.emoji}</Text>
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName}>{s.name}</Text>
                      <Text style={styles.suggestionReason}>{s.reason}</Text>
                      {s.adapted_from && (
                        <Text style={styles.adaptedFrom}>
                          📍 Adapted from: {s.adapted_from}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}

                {motivationalQuote ? (
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>"{motivationalQuote}"</Text>
                  </View>
                ) : null}

                <TouchableOpacity style={styles.proceedBtn} onPress={onClose}>
                  <Text style={styles.proceedText}>Start My Day! 🚀</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 4,
  },
  question: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },
  moodCard: {
    width: '44%',
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moodEmoji: { fontSize: 40, marginBottom: 8 },
  moodLabel: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  skipBtn: { alignItems: 'center', paddingTop: 12 },
  skipText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },

  // Suggestions
  moodBadge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'center', borderRadius: 9999,
    paddingHorizontal: 20, paddingVertical: 10,
    marginBottom: 16, gap: 8,
  },
  moodBadgeEmoji: { fontSize: 24 },
  moodBadgeLabel: { fontSize: 16, fontWeight: '800' },
  moodMessage: {
    fontSize: 15, color: Colors.textPrimary, textAlign: 'center',
    fontWeight: '600', marginBottom: 20, lineHeight: 22,
  },
  suggestionsTitle: {
    fontSize: 14, fontWeight: '800', color: Colors.textPrimary,
    marginBottom: 12,
  },
  suggestionCard: {
    flexDirection: 'row', backgroundColor: '#F8F9FA',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E8E8E8',
    alignItems: 'flex-start', gap: 12,
  },
  suggestionEmoji: { fontSize: 28, marginTop: 2 },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  suggestionReason: { fontSize: 12, color: Colors.textMuted, marginTop: 3, lineHeight: 17 },
  adaptedFrom: { fontSize: 11, color: Colors.green, marginTop: 3, fontWeight: '700' },
  quoteBox: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12, padding: 14, marginVertical: 16,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  quoteText: { fontSize: 13, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 20, fontWeight: '600' },
  proceedBtn: {
    backgroundColor: Colors.primary, borderRadius: 9999,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  proceedText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
