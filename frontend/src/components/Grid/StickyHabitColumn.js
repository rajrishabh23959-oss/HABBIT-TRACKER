import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';

const CELL_HEIGHT = 36;
const HEADER_HEIGHT = 24;
const NAME_CELL_HEIGHT = 48;

const StickyHabitColumn = memo(({ habits }) => {
  return (
    <View style={styles.container}>
      {/* "My Habits" header — Primary #0F332B background with white bold text */}
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>My Habits</Text>
      </View>

      {/* Day sub-header spacer */}
      <View style={styles.subHeaderSpacer} />

      {/* Habit name rows */}
      {habits.map((habit, index) => (
        <View
          key={habit.id}
          style={[
            styles.habitRow,
            index % 2 === 0 ? styles.rowEven : styles.rowOdd,
          ]}
        >
          <Text style={styles.habitEmoji}>{habit.emoji}</Text>
          <Text style={styles.habitName} numberOfLines={2}>{habit.name}</Text>
        </View>
      ))}

      {/* Wellness rows */}
      <View style={[styles.habitRow, styles.wellnessRow]}>
        <Text style={styles.habitEmoji}>😊</Text>
        <Text style={styles.habitName}>Mood (1-10)</Text>
      </View>
      <View style={[styles.habitRow, styles.wellnessRow, styles.rowOdd]}>
        <Text style={styles.habitEmoji}>😴</Text>
        <Text style={styles.habitName}>Hours of Sleep</Text>
      </View>
    </View>
  );
});

StickyHabitColumn.displayName = 'StickyHabitColumn';

export const STICKY_CELL_HEIGHT = CELL_HEIGHT;
export const STICKY_HEADER_HEIGHT = HEADER_HEIGHT;
export const STICKY_SUBHEADER_HEIGHT = HEADER_HEIGHT;
export const STICKY_NAME_HEIGHT = NAME_CELL_HEIGHT;

const styles = StyleSheet.create({
  container: {
    width: '40%',
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headerCell: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 10,
    backgroundColor: Colors.primary, // #0F332B
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  subHeaderSpacer: {
    height: HEADER_HEIGHT,
    backgroundColor: Colors.primary, // #0F332B
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  habitRow: {
    height: NAME_CELL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: Colors.surface, // #F4F4F2
  },
  habitEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  habitName: {
    color: Colors.textPrimary, // #0F332B
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  wellnessRow: {
    backgroundColor: Colors.surface,
  },
});

export default StickyHabitColumn;
