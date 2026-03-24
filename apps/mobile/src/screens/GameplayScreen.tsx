import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryInput from '../components/CategoryInput';
import { useGame } from '../context/GameContext';
import { useValidation } from '../hooks/useValidation';
import { BorderRadius, Colors, Spacing, Typography } from '../theme';

const GameplayScreen: React.FC = () => {
  const { state, setAnswer, stopBus } = useGame();
  const { categories, letter, round, answers, userId, players } = state;

  const { validationState, validate, resetValidation } = useValidation(letter);

  // Reset validation whenever the round/letter changes
  useEffect(() => {
    resetValidation();
  }, [round, letter, resetValidation]);

  // All categories filled with a non-empty word = STOP button enabled
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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Round / Letter header */}
      <View style={styles.header}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>Round {round}</Text>
        </View>
        <Text style={styles.letterDisplay}>{letter}</Text>
        <Text style={styles.letterSubtitle}>Start every word with</Text>
      </View>

      {/* Category inputs */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat) => (
          <CategoryInput
            key={cat}
            category={cat}
            letter={letter}
            value={answers[cat] ?? ''}
            status={validationState[cat] ?? 'idle'}
            onChangeText={(text) => setAnswer(cat, text)}
            onBlur={() => handleBlur(cat)}
          />
        ))}
      </ScrollView>

      {/* Stop the Bus button */}
      <View style={styles.footer}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  roundBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  roundText: { ...Typography.label },
  letterDisplay: {
    fontSize: 80,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 90,
  },
  letterSubtitle: { ...Typography.caption },
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
