import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';
import MoodModal from '../components/Modals/MoodModal';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const { login, register, setUser } = useAuthStore();
  const { initUserDashboard } = useHabitStore();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter email and password.');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password.trim());
      } else {
        await register(name.trim(), email.trim(), password.trim());
      }
      initUserDashboard({ isFresh: true });
      setShowMoodModal(true);
    } catch (err) {
      console.log('Auth error:', err);
      loginLocal();
    } finally {
      setLoading(false);
    }
  };

  const loginLocal = (customName) => {
    const userName = customName || name.trim() || (email ? email.split('@')[0] : 'Hero');
    setUser({
      id: 'usr_' + Date.now(),
      name: userName,
      email: email.trim() || 'demo@habitgame.app',
      xp: 150,
      level: 1,
    });
    initUserDashboard({ isFresh: false });
    setShowMoodModal(true);
  };

  const handleQuickDemo = () => {
    loginLocal('Rishab Raj');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>🌿</Text>
            </View>
            <Text style={styles.title}>HabitGame</Text>
            <Text style={styles.subtitle}>
              Turn daily routines into a gamified sanctuary of self-mastery
            </Text>
          </View>

          {/* Feature Highlights Pills */}
          <View style={styles.pillsRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>⭐ Level & XP</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🌱 Eco Garden</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🛡️ Urge Surfing</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            {/* Toggle Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabPill, isLogin && styles.tabPillActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabPill, !isLogin && styles.tabPillActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rishab Raj"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>
                  {isLogin ? 'Sign In →' : 'Start My Habit Journey →'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR INSTANT ACCESS</Text>
              <View style={styles.orLine} />
            </View>

            {/* Instant Demo / Guest Mode */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleQuickDemo}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnText}>⚡ 1-Click Demo / Explore App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Mood Check-In Modal */}
      <MoodModal
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#A7F3D0',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 16,
    fontWeight: '500',
  },

  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featurePillText: {
    color: '#ECFDF5',
    fontSize: 11,
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Theme.radius.full,
    padding: 3,
    marginBottom: 20,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.full,
  },
  tabPillActive: {
    backgroundColor: '#064E3B',
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textDark,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  demoBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: Theme.radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  demoBtnText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
