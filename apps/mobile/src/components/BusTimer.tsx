import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Typography } from '@/src/theme';

interface BusTimerProps {
  seconds: number;
  label?: string;
  size?: 'small' | 'large';
}

const BusTimer: React.FC<BusTimerProps> = ({
  seconds,
  label,
  size = 'large',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const isLarge = size === 'large';
  const isUrgent = seconds <= 3;

  useEffect(() => {
    // Pulse animation on each tick when urgent
    if (isUrgent && seconds > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [seconds, isUrgent, scaleAnim]);

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isUrgent ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [isUrgent, colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surfaceLight, Colors.errorDim],
  });

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.text, Colors.error],
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.circle,
          isLarge ? styles.circleLarge : styles.circleSmall,
          { backgroundColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.Text
          style={[
            isLarge ? styles.textLarge : styles.textSmall,
            { color: textColor },
          ]}
        >
          {seconds}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  circleLarge: {
    width: 96,
    height: 96,
  },
  circleSmall: {
    width: 48,
    height: 48,
  },
  textLarge: {
    ...Typography.heading1,
    fontSize: 44,
    fontWeight: '900',
  },
  textSmall: {
    ...Typography.heading2,
  },
});

export default BusTimer;
