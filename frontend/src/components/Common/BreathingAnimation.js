import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../../theme/colors';

const PHASE_TEXT = {
  inhale: { label: 'Breathe In', color: '#4CAF50', scale: 1.3 },
  hold: { label: 'Hold', color: '#FF9800', scale: 1.3 },
  exhale: { label: 'Breathe Out', color: '#2196F3', scale: 0.8 },
  idle: { label: 'Ready...', color: Colors.primary, scale: 1.0 },
};

export default function BreathingAnimation({ phase = 'idle', timerSeconds = 60 }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const config = PHASE_TEXT[phase] || PHASE_TEXT.idle;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: config.scale,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: phase === 'hold' ? 1.0 : 0.7,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase]);

  const config = PHASE_TEXT[phase] || PHASE_TEXT.idle;
  const progress = timerSeconds / 60;
  const circumference = 2 * Math.PI * 70;

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: config.color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Inner circle */}
      <Animated.View
        style={[
          styles.innerCircle,
          {
            backgroundColor: config.color + '22',
            borderColor: config.color,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.timerText}>{timerSeconds}</Text>
        <Text style={styles.timerSub}>seconds</Text>
      </Animated.View>

      {/* Phase label */}
      <Text style={[styles.phaseLabel, { color: config.color }]}>
        {config.label}
      </Text>

      <Text style={styles.tipText}>
        {phase === 'inhale' && '4 seconds mein naak se saans lo...'}
        {phase === 'hold' && 'Rok ke rakho...'}
        {phase === 'exhale' && 'Dheere muh se chhodo...'}
        {phase === 'idle' && 'Thoda sa ruk jaao...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  timerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: -4,
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
