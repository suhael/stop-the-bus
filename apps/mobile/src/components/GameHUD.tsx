// apps/mobile/src/components/GameHUD.tsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/context/GameContext';
import { useCountdown } from '@/src/hooks/useGameLoop';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Visible height of the bar below the safe area inset. */
export const HUD_HEIGHT = 56;

const ROUND_DURATION = 180;

/** Deterministic avatar background colours derived from the first character. */
const AVATAR_PALETTE = [
  '#E76F51', '#2A9D8F', '#457B9D', '#8338EC',
  '#F4A261', '#C77DFF', '#06D6A0', '#E63946',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameHUD() {
  const { state, leaveRoom } = useGame();
  const {
    screen,
    nickname,
    userId,
    isConnected,
    roundEndTime,
    scrambleTimeRemaining,
    roundResult,
    round,
  } = state;
  const insets = useSafeAreaInsets();

  const isScrambling = scrambleTimeRemaining > 0;
  // GAMEPLAY and SCRAMBLE both map to screen === 'GAMEPLAY' in the reducer
  const showTimer = screen === 'GAMEPLAY' || screen === 'SCRAMBLE';
  const showScore =
    screen === 'GAMEPLAY' || screen === 'SCRAMBLE' || screen === 'RESULTS';

  // ── Derived player score — persists across the gap when roundResult is null
  //    (GAME_STARTED clears roundResult at the start of each round, so without
  //    this the score pill would flicker back to 0 every new round).
  const lastScoreRef = useRef(0);
  const freshScore = roundResult?.leaderboard?.find((p) => p.userId === userId)?.score;
  if (freshScore !== undefined) lastScoreRef.current = freshScore;
  const myScore = lastScoreRef.current;

  // ── Round timer — synced to server's absolute roundEndTime ────────────────
  const [roundSeconds, setRoundSeconds] = React.useState(() =>
    roundEndTime
      ? Math.max(0, Math.round((roundEndTime - Date.now()) / 1000))
      : ROUND_DURATION,
  );

  useEffect(() => {
    setRoundSeconds(
      roundEndTime
        ? Math.max(0, Math.round((roundEndTime - Date.now()) / 1000))
        : ROUND_DURATION,
    );
  }, [round, roundEndTime]);

  useEffect(() => {
    if (isScrambling || roundSeconds <= 0 || !showTimer) return;
    const id = setInterval(() => {
      if (roundEndTime) {
        setRoundSeconds(Math.max(0, Math.round((roundEndTime - Date.now()) / 1000)));
      } else {
        setRoundSeconds((s) => Math.max(0, s - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [roundSeconds, isScrambling, roundEndTime, showTimer]);

  // ── Scramble countdown (local, mirrors GameplayScreen's own countdown) ─────
  const { seconds: scrambleSeconds } = useCountdown(scrambleTimeRemaining, isScrambling);

  // ── Animations ────────────────────────────────────────────────────────────
  // All use useNativeDriver: true — colour-swap is handled via overlay opacity
  const gameplayOpacity = useRef(new Animated.Value(0)).current;
  const scrambleOverlayOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreBumpAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<ReturnType<typeof Animated.loop> | null>(null);

  // Fade-in/out of timer + score pill when entering/leaving gameplay
  useEffect(() => {
    Animated.timing(gameplayOpacity, {
      toValue: showScore ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showScore]);

  // Scramble: red overlay cross-fade + repeating scale pulse
  useEffect(() => {
    Animated.timing(scrambleOverlayOpacity, {
      toValue: isScrambling ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (isScrambling) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 550,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [isScrambling]);

  // Score bump when points are awarded
  const prevScoreRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevScoreRef.current !== null && myScore !== prevScoreRef.current) {
      Animated.sequence([
        Animated.timing(scoreBumpAnim, {
          toValue: 1.3,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(scoreBumpAnim, {
          toValue: 1,
          stiffness: 220,
          damping: 14,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevScoreRef.current = myScore;
  }, [myScore]);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const initial = nickname ? nickname.charAt(0).toUpperCase() : '?';
  const avatarBg =
    AVATAR_PALETTE[(nickname.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

  // ── Timer display ─────────────────────────────────────────────────────────
  const timerDisplay = isScrambling
    ? `00:${scrambleSeconds.toString().padStart(2, '0')}`
    : formatTime(roundSeconds);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, height: insets.top + HUD_HEIGHT },
      ]}
    >
      <View style={styles.row}>
        {/* ── Left anchor: Avatar + Connection dot + Name ─────────────── */}
        <View style={styles.leftSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: isConnected ? Colors.success : Colors.error },
              ]}
              accessibilityLabel={
                isConnected ? 'Status: Connected' : 'Status: Disconnected'
              }
            />
          </View>
          <Text
            style={styles.playerName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {nickname}
          </Text>
        </View>

        {/* ── Center anchor: Round timer pill ─────────────────────────── */}
        {/*
         * pointerEvents="none" so touches aimed at left/right buttons are
         * never intercepted by this absolutely-centred section.
         */}
        <View style={styles.centerSection} pointerEvents="none">
          {showTimer && (
            <Animated.View
              style={{
                opacity: gameplayOpacity,
                transform: [{ scale: pulseAnim }],
              }}
            >
              {/*
               * Two-layer pill:
               *   1. The dark base is the plain View background.
               *   2. The red scramble layer fades in on top via opacity.
               *   overflow: 'hidden' clips the overlay to the pill border-radius.
               */}
              <View style={styles.timerPill}>
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    styles.timerScrambleBg,
                    { opacity: scrambleOverlayOpacity },
                  ]}
                />
                <Text
                  style={[
                    styles.timerText,
                    isScrambling && styles.timerTextScramble,
                  ]}
                  accessibilityLabel={`Round timer: ${timerDisplay}`}
                >
                  {timerDisplay}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* ── Right anchor: Score pill (gameplay) | Leave (lobby) | Settings (home) */}
        <View style={styles.rightSection}>
          {showScore ? (
            <Animated.View
              style={[
                styles.scorePill,
                {
                  opacity: gameplayOpacity,
                  transform: [{ scale: scoreBumpAnim }],
                },
              ]}
            >
              <Ionicons name="star" size={13} color={Colors.primary} />
              <Text style={styles.scoreText}>{myScore}</Text>
            </Animated.View>
          ) : screen === 'LOBBY' ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={leaveRoom}
              accessibilityLabel="Leave room"
            >
              <Ionicons name="exit-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            /* HOME — settings placeholder */
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(225, 113, 0, 0.25)',
    zIndex: 100,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },

  // ── Left ────────────────────────────────────────────────────────────────
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 0, // Allow name text to be squeezed below its natural width
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  connectionDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  playerName: {
    ...Typography.bodyBold,
    fontSize: 14,
    flex: 1,
    flexShrink: 1,
    color: Colors.text,
  },

  // ── Center ──────────────────────────────────────────────────────────────
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(70, 25, 1, 0.85)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    overflow: 'hidden', // Clips the red scramble overlay to the pill shape
    minWidth: 68,
  },
  timerScrambleBg: {
    backgroundColor: Colors.error,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerTextScramble: {
    color: Colors.white,
  },

  // ── Right ────────────────────────────────────────────────────────────────
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(70, 25, 1, 0.85)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
});
