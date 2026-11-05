import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import Colors from '../../theme/colors';
import { useMoodStore } from '../../store/useMoodStore';
import { useHabitStore } from '../../store/useHabitStore';

const COMMON_TRIGGERS = [
  { label: '☀️ Subah Uthne Ke Baad', value: 'Subah uthne ke baad' },
  { label: '☕ Chai/Coffee Ke Baad', value: 'Chai banane ke baad' },
  { label: '🚂 Office Pahunchne Par', value: 'Office pahunchne ke baad' },
  { label: '🍽️ Lunch Ke Baad', value: 'Lunch ke baad' },
  { label: '🌆 Ghar Aane Ke Baad', value: 'Ghar aane ke baad' },
  { label: '🌙 Sone Se Pehle', value: 'Sone se pehle' },
];

export default function HabitStackModal({ visible, onClose }) {
  const { saveHabitStack, loading } = useMoodStore();
  const { data } = useHabitStore();
  const [newHabit, setNewHabit] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [result, setResult] = useState(null);

  const habits = data?.habits || [];

  const handleCreate = async () => {
    if (!newHabit.trim() || !selectedTrigger) return;
    const res = await saveHabitStack(null, newHabit.trim(), selectedTrigger);
    setResult(res);
  };

  const handleClose = () => {
    setNewHabit('');
    setSelectedTrigger('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔗 Habit Stacking</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.desc}>
            Nayi aadat banana mushkil hota hai. Isko kisi purani routine ke saath "stack" karo!
          </Text>

          {!result ? (
            <>
              {/* New habit input */}
              <Text style={styles.label}>Nayi Habit Kya Hai?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5 pushups, 10-min walk..."
                placeholderTextColor={Colors.textMuted}
                value={newHabit}
                onChangeText={setNewHabit}
              />

              {/* Trigger selector */}
              <Text style={styles.label}>Existing Routine Choose Karo</Text>
              {COMMON_TRIGGERS.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.triggerCard,
                    selectedTrigger === t.value && styles.triggerCardActive,
                  ]}
                  onPress={() => setSelectedTrigger(t.value)}
                >
                  <Text style={[
                    styles.triggerText,
                    selectedTrigger === t.value && styles.triggerTextActive,
                  ]}>
                    {t.label}
                  </Text>
                  {selectedTrigger === t.value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.createBtn,
                  (!newHabit.trim() || !selectedTrigger) && styles.createBtnDisabled,
                ]}
                onPress={handleCreate}
                disabled={!newHabit.trim() || !selectedTrigger || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.createBtnText}>🤖 AI Se Best Time Poochho</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Result */}
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>✅ Habit Stack Taiyaar!</Text>
                <View style={styles.stackSentence}>
                  <Text style={styles.stackSentenceText}>
                    "{result.trigger} ke baad main{' '}
                    <Text style={{ color: Colors.primary, fontWeight: '900' }}>
                      {newHabit}
                    </Text>{' '}
                    karunga!"
                  </Text>
                </View>
                <Text style={styles.aiLabel}>🤖 AI Suggestion:</Text>
                <Text style={styles.aiText}>{result.sentence}</Text>

                {result.bestTriggers?.length > 0 && (
                  <>
                    <Text style={styles.altLabel}>Other good triggers:</Text>
                    {result.bestTriggers.slice(0, 3).map((t, i) => (
                      <Text key={i} style={styles.altTrigger}>• {t}</Text>
                    ))}
                  </>
                )}
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={handleClose}>
                <Text style={styles.createBtnText}>✨ Done! Dashboard Par Jaao</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  closeBtn: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20 },
  desc: {
    fontSize: 14, color: Colors.textDark, lineHeight: 20, marginBottom: 20,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
  },
  label: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: Colors.textDark, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 20,
  },
  triggerCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  triggerCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  triggerText: { fontSize: 14, color: Colors.textDark, fontWeight: '600' },
  triggerTextActive: { color: Colors.primary, fontWeight: '800' },
  check: { fontSize: 16, color: Colors.primary, fontWeight: '900' },
  createBtn: {
    backgroundColor: Colors.primary, borderRadius: 9999,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
  },
  createBtnDisabled: { backgroundColor: Colors.textMuted },
  createBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  resultCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  resultTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary, marginBottom: 16 },
  stackSentence: {
    backgroundColor: Colors.primary + '15', borderRadius: 12, padding: 14, marginBottom: 14,
  },
  stackSentenceText: { fontSize: 15, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  aiLabel: { fontSize: 12, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  aiText: { fontSize: 14, color: Colors.textDark, lineHeight: 20, marginBottom: 14 },
  altLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 6 },
  altTrigger: { fontSize: 13, color: Colors.textDark, marginBottom: 4, paddingLeft: 4 },
});
