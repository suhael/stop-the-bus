import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusTimer from '@/src/components/BusTimer';
import { useGame } from '@/src/context/GameContext';
import { useCountdown } from '@/src/hooks/useGameLoop';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';
import { getScoreStyle } from '@/src/utils/format';

const ResultsScreen: React.FC = () => {
  const { state, startGame } = useGame();
  const { roundResult, players, userId, nextRound } = state;

  const isHost = players.find((p) => p.playerId === userId)?.isDriver ?? false;
  const hostTriggeredRef = useRef(false);

  // 6-second countdown before the host triggers the next round
  const handleNextRound = () => {
    if (isHost && !hostTriggeredRef.current) {
      hostTriggeredRef.current = true;
      startGame();
    }
  };

  const { seconds } = useCountdown(6, !!roundResult, handleNextRound);

  useEffect(() => {
    hostTriggeredRef.current = false;
  }, [nextRound]);

  if (!roundResult) return null;

  const { round, letter, scores, leaderboard, playerAnswers } = roundResult;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Round {round} Results</Text>
          <Text style={styles.letterBadge}>Letter: {letter}</Text>
        </View>

        {/* Countdown to next round */}
        <View style={styles.countdownRow}>
          <BusTimer seconds={seconds} label="Next round in" size="small" />
          {isHost ? (
            <Text style={styles.hostNote}>You'll start the next round automatically</Text>
          ) : (
            <Text style={styles.hostNote}>Waiting for the driver to start…</Text>
          )}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
          {leaderboard.map((entry, idx) => (
            <View
              key={entry.userId}
              style={[styles.leaderRow, entry.userId === userId && styles.selfRow]}
            >
              <Text style={styles.rank}>#{idx + 1}</Text>
              <Text style={styles.lbNickname} numberOfLines={1}>
                {entry.nickname}
                {entry.userId === userId ? ' (you)' : ''}
              </Text>
              <Text style={styles.lbScore}>{entry.score} pts</Text>
            </View>
          ))}
        </View>

        {/* Round scores breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 This Round</Text>
          {Object.entries(playerAnswers).map(([pid, catAnswers]) => {
            const player = players.find((p) => p.playerId === pid);
            const nickname = player?.nickname ?? pid;
            const roundScore = scores[pid] ?? 0;
            const isSelf = pid === userId;
            return (
              <View
                key={pid}
                style={[styles.playerAnswerBlock, isSelf && styles.selfBlock]}
              >
                <View style={styles.playerAnswerHeader}>
                  <Text style={styles.playerName}>
                    {nickname}
                    {isSelf ? ' (you)' : ''}
                  </Text>
                  <Text style={styles.playerRoundScore}>+{roundScore} pts</Text>
                </View>
                {Object.entries(catAnswers).map(([cat, word]) => {
                  const empty = !word.trim();
                  return (
                    <View key={cat} style={styles.wordRow}>
                      <Text style={styles.wordCat}>{cat}</Text>
                      <Text
                        style={[
                          styles.wordValue,
                          { color: empty ? Colors.textDim : Colors.text },
                        ]}
                      >
                        {word.trim() || '—'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.heading1, textAlign: 'center' },
  letterBadge: {
    ...Typography.label,
    color: Colors.primary,
    backgroundColor: Colors.errorDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hostNote: { ...Typography.caption, flex: 1, lineHeight: 18 },
  section: { gap: Spacing.sm },
  sectionTitle: { ...Typography.heading3 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selfRow: { borderColor: Colors.primary },
  rank: { ...Typography.bodyBold, color: Colors.textMuted, width: 28 },
  lbNickname: { ...Typography.body, flex: 1 },
  lbScore: { ...Typography.bodyBold, color: Colors.accent },
  playerAnswerBlock: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selfBlock: { borderColor: Colors.primary },
  playerAnswerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  playerName: { ...Typography.bodyBold },
  playerRoundScore: { ...Typography.bodyBold, color: Colors.success },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  wordCat: { ...Typography.caption, flex: 1, textTransform: 'capitalize' },
  wordValue: { ...Typography.body, flex: 1, textAlign: 'right' },
});

export default ResultsScreen;
