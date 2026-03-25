import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/src/context/GameContext';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';
import { getPodiumEmoji } from '@/src/utils/format';

const GameOverScreen: React.FC = () => {
  const { state, resetGame } = useGame();
  const { gameOverData, players, userId } = state;

  if (!gameOverData) return null;

  const { podium, playerAnswers, scores } = gameOverData;
  const winner = podium[0];
  const isWinner = winner?.userId === userId;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Winner announcement */}
        <View style={styles.victoryBanner}>
          <Text style={styles.victoryEmoji}>{isWinner ? '🏆' : '🎉'}</Text>
          <Text style={styles.victoryTitle}>
            {isWinner ? 'You won!' : `${winner?.nickname ?? 'Someone'} wins!`}
          </Text>
          <Text style={styles.victorySubtitle}>Game Over</Text>
        </View>

        {/* Podium */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Standings</Text>
          {podium.map((entry, idx) => {
            const isSelf = entry.userId === userId;
            return (
              <View
                key={entry.userId}
                style={[
                  styles.podiumRow,
                  idx === 0 && styles.firstPlace,
                  isSelf && styles.selfRow,
                ]}
              >
                <Text style={styles.podiumEmoji}>{getPodiumEmoji(idx + 1)}</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {entry.nickname}
                  {isSelf ? ' (you)' : ''}
                </Text>
                <Text
                  style={[
                    styles.podiumScore,
                    idx === 0 && { color: Colors.warning },
                  ]}
                >
                  {entry.score} pts
                </Text>
              </View>
            );
          })}
        </View>

        {/* All answers summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 All Answers</Text>
          {Object.entries(playerAnswers).map(([pid, catAnswers]) => {
            const player = players.find((p) => p.playerId === pid);
            const nickname = player?.nickname ?? pid;
            const totalScore = scores[pid] ?? 0;
            const isSelf = pid === userId;

            return (
              <View
                key={pid}
                style={[styles.answerBlock, isSelf && styles.selfBlock]}
              >
                <View style={styles.answerHeader}>
                  <Text style={styles.answerName}>
                    {nickname}
                    {isSelf ? ' (you)' : ''}
                  </Text>
                  <Text style={styles.answerTotal}>{totalScore} pts total</Text>
                </View>
                {Object.entries(catAnswers).map(([cat, word]) => (
                  <View key={cat} style={styles.answerRow}>
                    <Text style={styles.answerCat}>{cat}</Text>
                    <Text
                      style={[
                        styles.answerWord,
                        !word.trim() && { color: Colors.textDim },
                      ]}
                    >
                      {word.trim() || '—'}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* Play again */}
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={resetGame}
          activeOpacity={0.8}
        >
          <Text style={styles.playAgainText}>Play Again 🚌</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  victoryBanner: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  victoryEmoji: { fontSize: 72 },
  victoryTitle: { ...Typography.heading1, textAlign: 'center' },
  victorySubtitle: { ...Typography.label },
  section: { gap: Spacing.sm },
  sectionTitle: { ...Typography.heading3 },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  firstPlace: {
    backgroundColor: '#2A1F08',
    borderColor: Colors.warning,
  },
  selfRow: { borderColor: Colors.primary },
  podiumEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  podiumName: { ...Typography.bodyBold, flex: 1 },
  podiumScore: { ...Typography.bodyBold, color: Colors.accent, fontSize: 18 },
  answerBlock: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selfBlock: { borderColor: Colors.primary },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  answerName: { ...Typography.bodyBold },
  answerTotal: { ...Typography.bodyBold, color: Colors.success },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  answerCat: { ...Typography.caption, flex: 1, textTransform: 'capitalize' },
  answerWord: { ...Typography.body, flex: 1, textAlign: 'right' },
  playAgainButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  playAgainText: { ...Typography.heading3, color: Colors.white },
});

export default GameOverScreen;
