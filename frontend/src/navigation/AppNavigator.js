import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet, Platform } from 'react-native';
import Colors from '../theme/colors';
import Theme from '../theme/Theme';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import GardenScreen from '../screens/GardenScreen';
import AntiHabitScreen from '../screens/AntiHabitScreen';
import SocialScreen from '../screens/SocialScreen';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, label, focused }) {
  return (
    <View style={styles.tabIconWrapper}>
      <View style={[styles.tabPill, focused && styles.tabPillActive]}>
        <Ionicons
          name={focused ? name : `${name}-outline`}
          size={22}
          color={focused ? '#10B981' : '#64748B'}
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: focused ? '#10B981' : '#64748B',
            fontWeight: focused ? '800' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      {/* Tab 1: Daily Habits Checklist */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="checkbox" label="Habits" focused={focused} />
          ),
        }}
      />

      {/* Tab 2: Virtual Sanctuary Garden */}
      <Tab.Screen
        name="Garden"
        component={GardenScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="leaf" label="Garden" focused={focused} />
          ),
        }}
      />

      {/* Tab 3: Analytics & Insights */}
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="stats-chart" label="Stats" focused={focused} />
          ),
        }}
      />

      {/* Tab 4: Anti-Habits & Urge Surfing */}
      <Tab.Screen
        name="AntiHabits"
        component={AntiHabitScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shield-checkmark" label="Anti-Habit" focused={focused} />
          ),
        }}
      />

      {/* Tab 5: Community Hub (Kindness, Groups, Ghost Mode) */}
      <Tab.Screen
        name="Community"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people" label="Community" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  tabPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.2,
  },
});
