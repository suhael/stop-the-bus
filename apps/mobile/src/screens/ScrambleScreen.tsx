import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusTimer from '@/src/components/BusTimer';
import { useGame } from '@/src/context/GameContext';
import { useCountdown } from '@/src/hooks/useGameLoop';
import { Colors, Spacing, Typography } from '@/src/theme';

const ScrambleScreen: React.FC = () => {
  const { state, submitWords } = useGame();
  const { scrambleTimeRemaining, stopClickedBy, players, userId } = state;

  const submittedRef = useRef(false);

  const stopper = players.find((p) => p.playerId === stopClickedBy);
  const stopperName = stopper ? stopper.nickname : 'Someone';
  const isYouStopped = stopClickedBy === userId;

  const handleComplete = () => {
    if (!submittedRef.current) {
      submittedRef.current = true;
      submitWords();
    }
  };

  const { seconds } = useCountdown(scrambleTimeRemaining, true, handleComplete);

  // Reset submit flag when scramble initiates
  useEffect(() => {
    submittedRef.current = false;
  }, [scrambleTimeRemaining]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>🛑</Text>
        <Text style={styles.title}>Bus Stopped!</Text>
        <Text style={styles.subtitle}>
          {isYouStopped
            ? "You stopped the bus! Quick — finalise your answers!"
            : `${stopperName} stopped the bus! Finish up fast!`}
        </Text>

        <View style={styles.timerWrapper}>
          <BusTimer seconds={seconds} label="Seconds remaining" size="large" />
        </View>

        <Text style={styles.hint}>
          Your answers will be submitted automatically
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  icon: { fontSize: 80 },
  title: { ...Typography.heading1, textAlign: 'center', color: Colors.primary },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 24,
  },
  timerWrapper: {
    marginVertical: Spacing.xl,
  },
  hint: {
    ...Typography.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ScrambleScreen;
