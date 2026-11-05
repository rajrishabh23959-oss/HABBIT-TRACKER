import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import HabitCheckbox from './HabitCheckbox';
import StickyHabitColumn from './StickyHabitColumn';
import { getWeekGroups } from '../../utils/dateHelper';

const CELL_W = 30;   // checkbox cell width
const CELL_H = 48;   // row height
const HEADER_H = 24; // week/day header height

export default function HabitGrid({ totalDays, habits, wellness, onToggle, onWellnessChange }) {
  const horizontalScrollRef = useRef(null);
  const weekGroups = getWeekGroups(totalDays);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const renderWeekHeaders = () => (
    <View style={styles.headerRow}>
      {weekGroups.map((wg, i) => (
        <View key={i} style={[styles.weekCell, { width: wg.span * CELL_W }]}>
          <Text style={styles.weekLabel}>{wg.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderDayNumbers = () => (
    <View style={styles.subHeaderRow}>
      {days.map(d => (
        <View key={d} style={[styles.dayCell, { width: CELL_W }]}>
          <Text style={styles.dayLabel}>{d}</Text>
        </View>
      ))}
    </View>
  );

  const renderHabitRow = (habit, index) => (
    <View
      key={habit.id}
      style={[
        styles.habitRow,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
        { height: CELL_H },
      ]}
    >
      {days.map(d => (
        <View key={d} style={styles.cellWrapper}>
          <HabitCheckbox
            completed={!!habit.logs[String(d)]}
            onToggle={() => onToggle(habit.id, d)}
            size={26}
          />
        </View>
      ))}
    </View>
  );

  const renderWellnessRow = (type, label, color) => (
    <View style={[styles.habitRow, styles.wellnessRow, { height: CELL_H }]}>
      {days.map(d => {
        const val = wellness[type]?.[String(d)];
        return (
          <TouchableOpacity
            key={d}
            style={[styles.wellnessCell, { width: CELL_W - 4, borderColor: color }]}
            onPress={() => {
              const newVal = val ? null : (type === 'mood' ? 7 : 7.5);
              onWellnessChange(type, d, newVal);
            }}
          >
            <Text style={[styles.wellnessText, { color }]}>
              {val != null ? (type === 'sleep' ? val.toFixed(1) : Math.round(val)) : '·'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sticky Left Column */}
      <StickyHabitColumn habits={habits} />

      {/* Horizontally scrollable right panel */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={styles.rightPanel}
      >
        <View>
          {renderWeekHeaders()}
          {renderDayNumbers()}
          {habits.map((habit, i) => renderHabitRow(habit, i))}
          {renderWellnessRow('mood', '😊', Colors.green)}
          {renderWellnessRow('sleep', '😴', Colors.textDark)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: Colors.background,
  },
  rightPanel: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    height: HEADER_H,
    backgroundColor: Colors.primary, // #0F332B
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subHeaderRow: {
    flexDirection: 'row',
    height: HEADER_H,
    backgroundColor: Colors.primary, // #0F332B
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weekCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  weekLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  habitRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // #E8E8E6 thin border
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: Colors.surface, // #F4F4F2 off-white
  },
  cellWrapper: {
    width: CELL_W,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border, // 1px light gray grid line
    height: '100%',
  },
  wellnessRow: {
    backgroundColor: Colors.surface,
  },
  wellnessCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    margin: 2,
    height: 24,
    backgroundColor: '#FFFFFF',
  },
  wellnessText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
