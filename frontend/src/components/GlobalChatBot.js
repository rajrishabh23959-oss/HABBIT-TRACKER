import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Modal
} from 'react-native';
import { useChatBotStore } from '../store/useChatBotStore';
import { useAuthStore } from '../store/useAuthStore';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const PROMPT_CHIPS = [
  'Suggest a 3-step morning routine 🌅',
  'How do I beat procrastination? ⚡',
  'How do I ride a craving wave? 🛡️',
  'Give me a habit stack formula 🔗',
];

const LOCAL_AI_RESPONSES = {
  morning: 'A scientifically backed morning routine: 1) Drink 500ml water immediately upon waking, 2) Get 5 mins of natural sunlight, 3) 5 mins of light stretching or breathwork. Start small and build momentum! ☀️',
  procrastination: 'The "2-Minute Rule": When you feel resistance, tell yourself you will only do the habit for exactly 2 minutes (e.g. read 1 page, put on gym shoes). 85% of the battle is crossing the threshold of initiation! 🚀',
  craving: 'Remember Urge Surfing! Physical cravings peak at ~60-90 seconds. Go to the Anti-Habit tab, trigger the 60s box breathing exercise, and let the dopamine craving crest and fade naturally. 🌊',
  stack: 'Formula: "After I [CURRENT HABIT], I will [NEW HABIT]." Example: "After I pour my morning coffee ☕, I will meditate for 3 minutes 🧘." This links new habits directly to existing neural pathways! 💡',
  default: 'Consistency compounds like interest! Focus on showing up every single day—even for 1 minute. What habit are you focusing on today? 💪',
};

export default function GlobalChatBot() {
  const { isOpen, closeChatBot } = useChatBotStore();
  const { token, user } = useAuthStore();
  
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: `Hello ${user?.name || 'Friend'}! 🤖 I'm Coach Max, your Habit & Wellness AI Guide. How can I help you build unstoppable momentum today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(500)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const handleSend = async (customText) => {
    const text = (customText || input).trim();
    if (!text) return;

    const userMsg = { id: String(Date.now()), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/ai/chat`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 6000 }
      );
      const aiReply = res.data.response;
      setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', text: aiReply }]);
    } catch {
      // Intelligent fallback
      const lower = text.toLowerCase();
      let reply = LOCAL_AI_RESPONSES.default;
      if (lower.includes('morning') || lower.includes('routine')) reply = LOCAL_AI_RESPONSES.morning;
      else if (lower.includes('procrastinat') || lower.includes('lazy') || lower.includes('start')) reply = LOCAL_AI_RESPONSES.procrastination;
      else if (lower.includes('craving') || lower.includes('urge') || lower.includes('stop')) reply = LOCAL_AI_RESPONSES.craving;
      else if (lower.includes('stack') || lower.includes('formula') || lower.includes('trigger')) reply = LOCAL_AI_RESPONSES.stack;

      setMessages(prev => [...prev, { 
        id: String(Date.now() + 1), 
        role: 'assistant', 
        text: reply 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.msgText, isUser ? styles.userMsgText : styles.aiMsgText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeChatBot} />
        
        <Animated.View 
          style={[
            styles.drawer, 
            { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.coachAvatarBadge}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Coach Max AI</Text>
                <Text style={styles.headerSub}>Habit & Wellness Guide · Online</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeChatBot} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Starter Chips */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {PROMPT_CHIPS.map((chip, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={() => handleSend(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

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
              <View style={styles.aiBubble}>
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            </View>
          )}

          {/* Input Area */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask Coach Max for habit advice..."
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!input.trim() || loading}
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              >
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  drawer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 16,
    backgroundColor: '#064E3B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  
  chipsContainer: {
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  messageList: {
    padding: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 13,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiMsgText: {
    color: '#0F172A',
  },
  
  typingRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendText: {
    color: '#FFF',
    fontSize: 16,
  },
});
