import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '@/src/theme';

interface GameControlHeaderProps {
  letter: string;
  isValid: boolean;
  isScrambling: boolean;
  onStop: () => void;
}

const STOP_SIZE = 72;

/** Regular octagon polygon points (stop-sign orientation — flat top/bottom). */
function octagonPoints(size: number, inset = 2): string {
  const r = size / 2 - inset;
  const cx = size / 2;
  const cy = size / 2;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = ((22.5 + i * 45) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const STOP_POINTS = octagonPoints(STOP_SIZE);

// ─── Octagon SVG wrapper ──────────────────────────────────────────────────────
interface OctagonProps {
  size: number;
  points: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
}

function Octagon({ size, points, fill, stroke, strokeWidth = 0, children }: OctagonProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.octagonContent]}>
        {children}
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GameControlHeader({
  letter,
  isValid,
  isScrambling,
  onStop,
}: GameControlHeaderProps) {
  const scale = useSharedValue(1);
  const wasValid = useSharedValue(false);

  // Pop animation when the button first becomes active
  useEffect(() => {
    if (isValid && !wasValid.value) {
      scale.value = withSequence(
        withSpring(1.12, { stiffness: 500, damping: 12 }),
        withSpring(1.0, { stiffness: 400, damping: 15 }),
      );
    }
    wasValid.value = isValid;
  }, [isValid]);

  const stopAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(isValid && !isScrambling ? 1 : 0.42, { duration: 250 }),
  }));

  const handlePress = () => {
    if (!isValid || isScrambling) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStop();
  };

  const isActive = isValid && !isScrambling;
  const stopFill = isActive ? Colors.error : Colors.errorDim;

  return (
    <View style={styles.container}>

      {/* ── Center: Instruction + Target Letter ──────────────────────────── */}
      <View style={styles.centerAnchor}>
        <Text style={styles.instruction}>Start every word with</Text>
        <Text style={styles.letterDisplay}>{letter}</Text>
      </View>

      {/* ── Right: Stop sign octagon ──────────────────────────────────────── */}
      <View style={styles.rightAnchor}>
        <Animated.View
          style={[
            stopAnimStyle,
            isActive && styles.stopGlow,
          ]}
        >
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.82}
            accessibilityLabel="Stop the Bus"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isActive }}
          >
            <Octagon
              size={STOP_SIZE}
              points={STOP_POINTS}
              fill={stopFill}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2.5}
            >
              <Text style={styles.stopTextMain}>STOP</Text>
              <Text style={styles.stopTextSub}>THE BUS</Text>
            </Octagon>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  octagonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Left ─────────────────────────────────────────────────────────────────
  leftAnchor: {
    flex: 1,
    alignItems: 'flex-start',
  },
  roundMeta: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.white,
    letterSpacing: 2,
  },
  roundValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 22,
  },

  // ── Center ────────────────────────────────────────────────────────────────
  centerAnchor: {
    flex: 2,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  letterDisplay: {
    fontSize: 58,
    fontWeight: '900',
    color: Colors.white,
  },

  // ── Right ─────────────────────────────────────────────────────────────────
  rightAnchor: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stopGlow: {
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  stopTextMain: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    lineHeight: 18,
  },
  stopTextSub: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    lineHeight: 12,
    textAlign: 'center',
  },
});
