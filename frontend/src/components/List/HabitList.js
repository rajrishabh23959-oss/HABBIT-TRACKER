import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitList({ habits, onToggle }) {
  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{item.emoji || '💧'}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.habitName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.habitSubtitle} numberOfLines={1}>{item.stack_trigger || 'Daily Goal'}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {WEEK_DAYS.map((day, index) => {
            const dayNum = index + 1;
            const isCompleted = !!item.logs[String(dayNum)];
            return (
              <TouchableOpacity
                key={index}
                style={[styles.checkCircle, isCompleted && styles.checkCircleCompleted]}
                onPress={() => onToggle(item.id, dayNum)}
              >
                {isCompleted ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Since it's inside a ScrollView in DashboardScreen
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(106, 156, 121, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#7A7A7A',
  },
  rightSection: {
    flexDirection: 'row',
    gap: 6,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D0D0CE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  checkCircleCompleted: {
    backgroundColor: '#6A9C79',
    borderColor: '#6A9C79',
  },
  checkMark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
