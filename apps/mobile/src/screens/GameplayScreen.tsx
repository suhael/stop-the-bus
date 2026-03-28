import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryInput from '@/src/components/CategoryInput';
import { useGame } from '@/src/context/GameContext';
import { useValidation } from '@/src/hooks/useValidation';
import { useCountdown } from '@/src/hooks/useGameLoop';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const ROUND_DURATION = 180;

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const GameplayScreen: React.FC = () => {
  const { state, setAnswer, stopBus, submitWords } = useGame();
  const { categories, letter, round, answers, userId, players, scrambleTimeRemaining, stopClickedBy, roundEndTime } = state;

  const isScrambling = scrambleTimeRemaining > 0;

  // ── Round timer — synced to server's absolute roundEndTime ───────────────
  const [roundSeconds, setRoundSeconds] = useState(() =>
    roundEndTime ? Math.max(0, Math.round((roundEndTime - Date.now()) / 1000)) : ROUND_DURATION
  );
  useEffect(() => {
    // Reset immediately when a new round starts
    setRoundSeconds(
      roundEndTime ? Math.max(0, Math.round((roundEndTime - Date.now()) / 1000)) : ROUND_DURATION
    );
  }, [round, roundEndTime]);
  useEffect(() => {
    if (isScrambling || roundSeconds <= 0) return;
    const id = setInterval(() => {
      if (roundEndTime) {
        // Recalculate from the absolute timestamp on each tick — stays in sync after reconnects
        setRoundSeconds(Math.max(0, Math.round((roundEndTime - Date.now()) / 1000)));
      } else {
        setRoundSeconds((s) => Math.max(0, s - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [roundSeconds, isScrambling, roundEndTime]);

  // ── Scramble countdown & auto-submit ────────────────────────────────────
  // Guard is keyed by round number — resets automatically on each new round
  const submittedRoundRef = useRef<number | null>(null);
  const handleScrambleComplete = useCallback(() => {
    if (submittedRoundRef.current !== round) {
      submittedRoundRef.current = round;
      submitWords();
    }
  }, [submitWords, round]);
  const { seconds: scrambleSeconds } = useCountdown(
    scrambleTimeRemaining,
    isScrambling,
    handleScrambleComplete,
  );

  const { validationState, validationErrors, validate, resetValidation } = useValidation(letter);
  useEffect(() => {
    resetValidation();
  }, [round, letter, resetValidation]);

  const allFilled = useMemo(
    () =>
      categories.length > 0 &&
      categories.every((cat) => (answers[cat] ?? '').trim().length > 0),
    [categories, answers],
  );

  const handleBlur = useCallback(
    (category: string) => {
      validate(category, answers[category] ?? '');
    },
    [validate, answers],
  );

  const isHost = players.find((p) => p.playerId === userId)?.isDriver ?? false;

  const stopper = players.find((p) => p.playerId === stopClickedBy);
  const stopperName = stopper ? stopper.nickname : 'Someone';
  const isYouStopped = stopClickedBy === userId;

  const timerIsUrgent = !isScrambling && roundSeconds <= 30;
  const timerColor = isScrambling
    ? Colors.error
    : timerIsUrgent
    ? Colors.warning
    : Colors.primary;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Round / Letter header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>Round {round}</Text>
          </View>
          <View style={[styles.timerBadge, isScrambling && styles.timerBadgeScramble, timerIsUrgent && styles.timerBadgeUrgent]}>
            <Text style={[styles.timerText, { color: timerColor }]}>
              {isScrambling ? `⚡ ${scrambleSeconds}s` : formatTime(roundSeconds)}
            </Text>
          </View>
        </View>
        <Text style={styles.letterDisplay}>{letter}</Text>
        <Text style={styles.letterSubtitle}>Start every word with</Text>
      </View>

      {/* Scramble warning banner */}
      {isScrambling && (
        <View style={styles.scrambleBanner}>
          <Text style={styles.scrambleBannerText}>
            🛑{' '}
            {isYouStopped
              ? 'You stopped the bus! Finalise your answers!'
              : `${stopperName} stopped the bus! Finish up fast!`}
          </Text>
        </View>
      )}

      {/* Category inputs */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat) => (
          <CategoryInput
            key={cat}
            category={cat}
            letter={letter}
            value={answers[cat] ?? ''}
            status={validationState[cat] ?? 'idle'}
            errorMessage={validationErrors[cat]}
            onChangeText={(text) => setAnswer(cat, text)}
            onBlur={() => handleBlur(cat)}
            disabled={isScrambling}
          />
        ))}
      </ScrollView>

      {/* Stop the Bus button / scramble hint */}
      <View style={styles.footer}>
        {isScrambling ? (
          <Text style={styles.scrambleHint}>
            ⏳ Your answers will be submitted automatically…
          </Text>
        ) : (
          <>
            {!allFilled && (
              <Text style={styles.hint}>Fill all categories to stop the bus</Text>
            )}
            <TouchableOpacity
              style={[styles.stopButton, !allFilled && styles.stopButtonDisabled]}
              onPress={stopBus}
              disabled={!allFilled}
              activeOpacity={0.85}
            >
              <Text style={styles.stopButtonText}>🛑 Stop the Bus!</Text>
            </TouchableOpacity>

            {isHost && (
              <Text style={styles.hostNote}>You're the driver 🚌</Text>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  roundText: { ...Typography.label },
  timerBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerBadgeUrgent: {
    borderColor: Colors.warning,
    backgroundColor: Colors.surfaceLight,
  },
  timerBadgeScramble: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorDim,
  },
  timerText: {
    ...Typography.label,
    fontVariant: ['tabular-nums'],
  },
  letterDisplay: {
    fontSize: 80,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 90,
  },
  letterSubtitle: { ...Typography.caption },
  scrambleBanner: {
    backgroundColor: Colors.errorDim,
    borderBottomWidth: 1,
    borderBottomColor: Colors.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  scrambleBannerText: {
    ...Typography.bodyBold,
    color: Colors.error,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  hint: { ...Typography.caption, textAlign: 'center', color: Colors.textMuted },
  scrambleHint: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: Spacing.md,
  },
  stopButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  stopButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
  },
  stopButtonText: {
    ...Typography.heading3,
    color: Colors.white,
    fontSize: 22,
  },
  hostNote: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
  },
});

export default GameplayScreen;
