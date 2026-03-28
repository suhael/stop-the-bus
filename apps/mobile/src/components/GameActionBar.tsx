// apps/mobile/src/components/GameActionBar.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

interface GameActionBarProps {
  round: number;
  totalRounds?: number;
  allFilled: boolean;
  isScrambling: boolean;
  onStopBus: () => void;
}

const CIRCLE_SIZE = 52;
const STOP_BUTTON_SIZE = 68; // ~30% larger

export default function GameActionBar({
  round,
  totalRounds,
  allFilled,
  isScrambling,
  onStopBus,
}: GameActionBarProps) {
  const insets = useSafeAreaInsets();

  // ── Stop button: breathing scale when enabled ─────────────────────────────
  const breathe = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    if (allFilled && !isScrambling) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.07, { duration: 850, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(breathe);
      breathe.value = withTiming(1, { duration: 200 });
    }
  }, [allFilled, isScrambling]);

  const stopButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value * press.value }],
  }));

  // Tap gesture for the press-down animation + action
  const tap = Gesture.Tap()
    .onBegin(() => {
      press.value = withTiming(0.88, { duration: 80 });
    })
    .onFinalize(() => {
      press.value = withSpring(1, { stiffness: 400, damping: 15 });
    })
    .onEnd(() => {
      if (allFilled && !isScrambling) {
        onStopBus();
      }
    })
    .runOnJS(true);

  // ── Right indicator: bus ↔ stop-hand with cross-fade ─────────────────────
  const busOpacity = useSharedValue(1);
  const stopHandOpacity = useSharedValue(0);

  useEffect(() => {
    busOpacity.value = withTiming(isScrambling ? 0 : 1, { duration: 300 });
    stopHandOpacity.value = withTiming(isScrambling ? 1 : 0, { duration: 300 });
  }, [isScrambling]);

  const busStyle = useAnimatedStyle(() => ({ opacity: busOpacity.value }));
  const stopHandStyle = useAnimatedStyle(() => ({ opacity: stopHandOpacity.value }));

  // ── Derived visuals ───────────────────────────────────────────────────────
  const buttonDisabled = !allFilled || isScrambling;
  const buttonBg = buttonDisabled ? Colors.surfaceLight : Colors.error;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {/* Hint line above the bar */}
      {!isScrambling && (
        <Text style={styles.hint}>
          {allFilled ? '' : 'Fill every category to stop the bus'}
        </Text>
      )}
      {isScrambling && (
        <Text style={styles.hint}>⏳ Answers submit automatically…</Text>
      )}

      <View style={styles.bar}>
        {/* ── Left: Round badge ─────────────────────────────────────────── */}
        <View style={[styles.circle, styles.roundCircle]}>
          <Text style={styles.roundLabel}>
            {totalRounds ? `${round}/${totalRounds}` : `Rnd ${round}`}
          </Text>
        </View>

        {/* ── Center: Stop the Bus button ───────────────────────────────── */}
        <GestureDetector gesture={tap}>
          <Animated.View
            style={[
              styles.stopButton,
              { backgroundColor: buttonBg },
              stopButtonStyle,
            ]}
            accessibilityLabel="Stop the Bus"
            accessibilityRole="button"
            accessibilityState={{ disabled: buttonDisabled }}
          >
            <Text style={styles.stopIcon}>🛑</Text>
          </Animated.View>
        </GestureDetector>

        {/* ── Right: Bus / Stop-hand indicator ──────────────────────────── */}
        <View style={[styles.circle, styles.indicatorCircle]}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, busStyle]}>
            <Ionicons name="bus" size={24} color={Colors.primary} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, stopHandStyle]}>
            <Ionicons name="hand-left" size={24} color={Colors.error} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(225, 113, 0, 0.3)',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  hint: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textMuted,
    minHeight: 18,
    marginBottom: Spacing.xs,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  // Side circles
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundCircle: {
    backgroundColor: Colors.surfaceLight,
  },
  roundLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '700',
  },
  indicatorCircle: {
    backgroundColor: Colors.surfaceLight,
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stop button
  stopButton: {
    width: STOP_BUTTON_SIZE,
    height: STOP_BUTTON_SIZE,
    borderRadius: STOP_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stopIcon: {
    fontSize: 28,
    lineHeight: 34,
  },
});
