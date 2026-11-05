import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import Colors from '../../theme/colors';
import { useHabitStore } from '../../store/useHabitStore';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Suggested quick prompts
const QUICK_PROMPTS = [
  'Mujhe motivate karo!',
  'Aaj kaisi progress hai?',
  'Habit chhoti karne ka tarika?',
  'Stress kam karne ke tips?',
];

function buildSystemContext(habitData) {
  if (!habitData) return '';
  const { habits, overallStats, wellness } = habitData;
  const habitSummary = habits.map(h => {
    const done = Object.values(h.logs).filter(Boolean).length;
    return `${h.emoji} ${h.name}: ${done}/${Object.keys(h.logs).length} days completed`;
  }).join('\n');
  return `HabitGame AI Coach — User habit data:\n${habitSummary}\nOverall: ${overallStats?.completionPercentage}% complete.`;
}

export default function AIChatModal({ onClose }) {
  const data = useHabitStore(s => s.data);
  const { token, user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: `Hey ${user?.name || 'dost'}! 👋 Main aapka HabitGame AI Coach hoon. Aapki habits dekh sakta hoon aur personalized advice de sakta hoon. Kya poochna hai? 😊`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [missedHabits, setMissedHabits] = useState([]);
  const [showMissedBanner, setShowMissedBanner] = useState(false);
  const listRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the AI dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sendMessage = useCallback(async (textOverride = null) => {
    const text = (textOverride || input).trim();
    if (!text) return;

    const userMsg = { id: String(Date.now()), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Use backend chat endpoint (Feature #8 — detects missed habits, uses Gemini)
      const allMsgs = [...messages, userMsg].filter(m => m.id !== '0');
      const res = await axios.post(
        `${API_BASE}/chat/message`,
        {
          messages: allMsgs.map(m => ({ role: m.role, content: m.text })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );
      const aiReply = res.data.reply;
      const missed = res.data.missed_habits || [];

      if (missed.length > 0 && !showMissedBanner) {
        setMissedHabits(missed);
        setShowMissedBanner(true);
      }

      setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', text: aiReply }]);
    } catch (err) {
      // Fallback: try direct Gemini if backend unavailable
      try {
        const systemCtx = buildSystemContext(data);
        const GEMINI_KEY = 'AIzaSyDummyKeyReplaceWithReal'; // Replace with actual key
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

        const filteredHistory = messages.filter(m => m.id !== '0' && m.role === 'user' || m.role === 'assistant');
        const requestBody = {
          systemInstruction: { parts: [{ text: systemCtx + '\n\nBaat karo Hinglish mein — warm aur motivating.' }] },
          contents: [
            ...filteredHistory.slice(-4).map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }],
            })),
            { role: 'user', parts: [{ text }] },
          ],
        };

        const apiRes = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const json = await apiRes.json();
        const aiText = json?.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(text);
        setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', text: aiText }]);
      } catch {
        setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', text: getFallbackResponse(text) }]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, data, token]);

  function getFallbackResponse(userText) {
    const responses = [
      `Haan baat karo! ${user?.name ? user.name + ', aap' : 'Aap'} bahut acha kar rahe hain! 💪`,
      'Koi baat nahi yaar — ek din miss hona fail nahi hai. Kal fresh start! 🌅',
      'Chaliye goals thode adjust karte hain. Chhote steps, badi jeet! 🎯',
      'Aapki consistency dekh ke dil khush hota hai. Aur 5 minute try karo! ✨',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && <Text style={styles.avatar}>🤖</Text>}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
        {isUser && <Text style={styles.avatar}>👤</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.aiDot, { opacity: pulseAnim }]} />
          <Text style={styles.headerTitle}>🤖 AI Habit Coach</Text>
          <Text style={styles.onlineTag}> ONLINE</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Missed habits banner */}
      {showMissedBanner && missedHabits.length > 0 && (
        <View style={styles.missedBanner}>
          <Text style={styles.missedBannerText}>
            ⚠️ {missedHabits.slice(0, 2).join(', ')} — kuch din se miss ho rahe hain. AI ne notice kiya!
          </Text>
          <TouchableOpacity onPress={() => setShowMissedBanner(false)}>
            <Text style={styles.missedBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}> AI soch raha hai...</Text>
          </View>
        </View>
      )}

      {/* Quick prompts */}
      {messages.length <= 2 && !loading && (
        <View style={styles.quickPromptsRow}>
          <FlatList
            data={QUICK_PROMPTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.quickPrompt} onPress={() => sendMessage(item)}>
                <Text style={styles.quickPromptText}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Apna sawaal poochho..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 8 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  onlineTag: { color: '#4CAF50', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  closeBtn: { padding: 8 },
  closeText: { color: '#FFF', fontSize: 20, fontWeight: '700' },

  missedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF9C4', paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F9A825',
  },
  missedBannerText: { flex: 1, fontSize: 11, color: '#5D4037', fontWeight: '600' },
  missedBannerClose: { color: Colors.textMuted, fontSize: 14, paddingLeft: 10 },

  messageList: { padding: 12, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  avatar: { fontSize: 18, marginHorizontal: 6 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  aiBubble: {
    backgroundColor: Colors.surface, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  aiText: { color: Colors.textPrimary },

  typingRow: { paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 16, padding: 10,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.border,
  },
  typingText: { color: Colors.textMuted, fontSize: 12, marginLeft: 6 },

  quickPromptsRow: { paddingVertical: 8 },
  quickPrompt: {
    backgroundColor: Colors.surface, borderRadius: 9999, paddingHorizontal: 14,
    paddingVertical: 8, borderWidth: 1, borderColor: Colors.border,
  },
  quickPromptText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
  input: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: Colors.textPrimary,
    fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    marginLeft: 8, width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendText: { color: '#FFF', fontSize: 16 },
});
