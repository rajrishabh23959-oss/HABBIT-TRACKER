import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Alert, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Colors from '../../theme/colors';
import { useHabitStore } from '../../store/useHabitStore';

// ─── Emoji picker options ─────────────────────────────────────────────────
const EMOJI_OPTIONS = [
  '⏰','💪','📖','🗓️','🚫','🍺','📵','🚿','🧘','🤸',
  '🎯','🏃','🥗','💧','🧠','📝','🎮','🚴','💤','🌅',
  '🏋️','🧹','🛏️','🌿','🎵','📚','🩺','✍️','🥦','🏊',
];

export default function ManageHabitsModal({ onClose }) {
  const { data, addHabit, deleteHabit, reorderHabits } = useHabitStore();
  const habits = data?.habits || [];

  const [habitName, setHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAdd = () => {
    if (!habitName.trim()) {
      Alert.alert('Required', 'Please enter a habit name.');
      return;
    }
    if (habits.length >= 20) {
      Alert.alert('Limit Reached', 'You can have at most 20 habits.');
      return;
    }
    addHabit(habitName.trim(), selectedEmoji);
    setHabitName('');
    setSelectedEmoji('⭐');
    setShowEmojiPicker(false);
  };

  const handleDelete = (habit) => {
    Alert.alert(
      `Delete "${habit.emoji} ${habit.name}"?`,
      'All logged days for this habit will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  const renderHabitRow = ({ item, index }) => (
    <View style={styles.habitRow}>
      <View style={styles.habitLeft}>
        <Text style={styles.indexNum}>{index + 1}</Text>
        <Text style={styles.habitEmoji}>{item.emoji}</Text>
        <Text style={styles.habitName} numberOfLines={1}>{item.name}</Text>
      </View>
      <View style={styles.habitRight}>
        {/* Up / Down reorder */}
        <TouchableOpacity
          style={[styles.reorderBtn, index === 0 && styles.btnDisabled]}
          onPress={() => index > 0 && reorderHabits(index, index - 1)}
          disabled={index === 0}
        >
          <Text style={styles.reorderText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reorderBtn, index === habits.length - 1 && styles.btnDisabled]}
          onPress={() => index < habits.length - 1 && reorderHabits(index, index + 1)}
          disabled={index === habits.length - 1}
        >
          <Text style={styles.reorderText}>↓</Text>
        </TouchableOpacity>
        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>✏️ Manage Habits</Text>
          <Text style={styles.headerSub}>{habits.length} / 20 habits</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕ Done</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ─── Add New Habit Panel ─── */}
        <View style={styles.addPanel}>
          <Text style={styles.addTitle}>➕ Add a New Habit</Text>

          {/* Emoji picker row */}
          <View style={styles.emojiRow}>
            <TouchableOpacity
              style={styles.emojiPickerBtn}
              onPress={() => setShowEmojiPicker(v => !v)}
            >
              <Text style={styles.emojiPickerText}>{selectedEmoji}</Text>
              <Text style={styles.emojiPickerArrow}>▾</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Morning Run"
              placeholderTextColor={Colors.textMuted}
              value={habitName}
              onChangeText={setHabitName}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <TouchableOpacity
              style={[styles.addBtn, !habitName.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!habitName.trim()}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Emoji grid picker */}
          {showEmojiPicker && (
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiCell, selectedEmoji === e && styles.emojiCellActive]}
                  onPress={() => { setSelectedEmoji(e); setShowEmojiPicker(false); }}
                >
                  <Text style={styles.emojiCellText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ─── Habit List ─── */}
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>Add your first habit above to start tracking!</Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={item => item.id}
            renderItem={renderHabitRow}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.listHeader}>
                📋 Your Habits  <Text style={styles.listHeaderHint}>(↑↓ to reorder · 🗑 to delete)</Text>
              </Text>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
  },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: Colors.green, fontSize: 12, fontWeight: '700', marginTop: 2 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  closeText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Add Panel
  addPanel: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addTitle: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emojiPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 54,
    justifyContent: 'center',
  },
  emojiPickerText: { fontSize: 18 },
  emojiPickerArrow: { color: Colors.textMuted, fontSize: 10, marginLeft: 2 },
  nameInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textDark,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  // Emoji Grid
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  emojiCell: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emojiCellText: { fontSize: 20 },

  // Habit list
  listContent: { paddingHorizontal: 16, paddingBottom: 60 },
  listHeader: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 10,
  },
  listHeaderHint: {
    color: Colors.textMuted,
    fontWeight: '500',
    fontSize: 11,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  habitLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  indexNum: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  habitEmoji: { fontSize: 20, marginHorizontal: 8 },
  habitName: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  habitRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  reorderBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.3 },
  reorderText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  deleteText: { fontSize: 15 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
