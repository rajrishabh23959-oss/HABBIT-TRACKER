import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, Text, View, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalChatBot from './src/components/GlobalChatBot';
import { useChatBotStore } from './src/store/useChatBotStore';
import { useAuthStore } from './src/store/useAuthStore';

const FAB = () => {
  const { openChatBot } = useChatBotStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={openChatBot}
      activeOpacity={0.85}
    >
      <Text style={styles.fabIcon}>🤖</Text>
      <View style={styles.fabOnlineDot} />
    </TouchableOpacity>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>HabitGame Encountered an Issue</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <AppNavigator />
        <GlobalChatBot />
        <FAB />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 82,
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  fabIcon: { 
    fontSize: 24,
  },
  fabOnlineDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  errorMessage: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
