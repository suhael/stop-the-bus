import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryInput from '@/src/components/CategoryInput';
import GameControlHeader from '@/src/components/GameControlHeader';
import { useGame } from '@/src/context/GameContext';
import { useValidation } from '@/src/hooks/useValidation';
import { useCountdown } from '@/src/hooks/useGameLoop';
import { Colors, Spacing, Typography } from '@/src/theme';

const ROUND_DURATION = 180;


const GameplayScreen: React.FC = () => {
  const { state, setAnswer, stopBus, submitWords } = useGame();
  const { categories, letter, round, answers, userId, players, scrambleTimeRemaining, stopClickedBy, roundEndTime } = state;

  const isScrambling = scrambleTimeRemaining > 0;

  // ── Scramble haptic pulse — one light tap per second ─────────────────────
  const lastScrambleSecRef = useRef<number | null>(null);
  const { seconds: scrambleSeconds } = useCountdown(scrambleTimeRemaining, isScrambling);
  useEffect(() => {
    if (isScrambling && scrambleSeconds !== lastScrambleSecRef.current && scrambleSeconds > 0) {
      lastScrambleSecRef.current = scrambleSeconds;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isScrambling, scrambleSeconds]);

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

  // All filled AND none flagged as invalid (idle/valid/checking are acceptable)
  const allValid = useMemo(
    () =>
      allFilled &&
      categories.every((cat) => validationState[cat] !== 'invalid'),
    [allFilled, categories, validationState],
  );

  const handleBlur = useCallback(
    (category: string) => {
      validate(category, answers[category] ?? '');
    },
    [validate, answers],
  );

  // ── Stop bus — haptics handled inside GameControlHeader ─────────────────
  const handleStopBus = useCallback(() => {
    stopBus();
  }, [stopBus]);

  const stopper = players.find((p) => p.playerId === stopClickedBy);
  const stopperName = stopper ? stopper.nickname : 'Someone';
  const isYouStopped = stopClickedBy === userId;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      {/* Lottie animated background — behind all content, non-interactive */}
      <View style={styles.lottieContainer} pointerEvents="none">
        <LottieView
          source={require('../../assets/images/school-bus.json')}
          autoPlay
          loop
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.roundOverlay}>Round {round}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      {/* Game control header — round, letter, stop button */}
      <GameControlHeader
        letter={letter}
        isValid={allValid}
        isScrambling={isScrambling}
        onStop={handleStopBus}
      />

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
          />
        ))}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  lottieContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 192,
    zIndex: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundOverlay: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
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
});

export default GameplayScreen;
