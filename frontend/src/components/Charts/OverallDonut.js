import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Colors from '../../theme/colors';

export default function OverallDonut({ completed = 75, remaining = 25 }) {
  const size = 180;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = Math.max(1, completed + remaining);
  const percent = Math.min(1, Math.max(0, completed / total));
  const strokeDashoffset = circumference - (percent * circumference);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Completion Rate</Text>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background Track */}
            <Circle
              stroke="#F1F5F9"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Foreground Fill */}
            <Circle
              stroke="#10B981"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>

        {/* Center Text Overlay */}
        <View style={styles.centerOverlay}>
          <Text style={styles.percentText}>{Math.round(percent * 100)}%</Text>
          <Text style={styles.fractionText}>{completed} of {total} done</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  chartContainer: {
    position: 'relative',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  fractionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
});
