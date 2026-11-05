import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';

const HabitCheckbox = memo(({ completed, onToggle, size = 28 }) => {
  const handlePress = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          backgroundColor: completed ? Colors.green : '#FFFFFF',
          borderColor: completed ? Colors.green : Colors.border,
        },
      ]}
    >
      {completed && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );
});

HabitCheckbox.displayName = 'HabitCheckbox';

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
});

export default HabitCheckbox;
