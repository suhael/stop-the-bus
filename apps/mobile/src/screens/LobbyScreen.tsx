import React from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerCard from '../components/PlayerCard';
import { useGame } from '../context/GameContext';
import { BorderRadius, Colors, Spacing, Typography } from '../theme';

const LobbyScreen: React.FC = () => {
  const { state, startGame, resetGame } = useGame();
  const { players, roomCode, userId, error } = state;

  const isHost = players.find((p) => p.playerId === userId)?.isDriver ?? false;
  const canStart = isHost && players.length >= 2;

  const handleShareCode = () => {
    Share.share({
      message: `Join my Stop the Bus room! Code: ${roomCode}`,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.roomLabel}>Room Code</Text>
          <TouchableOpacity onPress={handleShareCode} activeOpacity={0.7}>
            <Text style={styles.roomCode}>{roomCode}</Text>
            <Text style={styles.tapToShare}>Tap to share 📤</Text>
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Players list */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Passengers ({players.length})
          </Text>
          <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
            {players.map((p) => (
              <View key={p.playerId} style={styles.playerRow}>
                <PlayerCard
                  nickname={p.nickname}
                  isHost={p.isDriver}
                  isYou={p.playerId === userId}
                />
              </View>
            ))}
            {players.length === 0 && (
              <Text style={styles.waitingText}>Waiting for players…</Text>
            )}
          </ScrollView>
        </View>

        {/* Host / Waiting message */}
        <View style={styles.footer}>
          {isHost ? (
            <>
              {players.length < 2 && (
                <Text style={styles.hint}>Need at least 2 players to start</Text>
              )}
              <TouchableOpacity
                style={[styles.startButton, !canStart && styles.buttonDisabled]}
                onPress={startGame}
                disabled={!canStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Game 🚌</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.waitingBanner}>
              <Text style={styles.waitingBannerText}>
                ⏳ Waiting for the driver to start…
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.leaveButton} onPress={resetGame}>
            <Text style={styles.leaveText}>Leave Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roomLabel: { ...Typography.label, marginBottom: Spacing.sm },
  roomCode: {
    ...Typography.heading1,
    color: Colors.primary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  tapToShare: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.xs },
  section: { flex: 1, marginBottom: Spacing.md },
  sectionLabel: { ...Typography.label, marginBottom: Spacing.sm },
  playerList: { flex: 1 },
  playerRow: { marginBottom: Spacing.sm },
  waitingText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg },
  footer: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  hint: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  startButtonText: { ...Typography.bodyBold, color: Colors.white, fontSize: 20 },
  waitingBanner: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waitingBannerText: { ...Typography.body, color: Colors.textMuted },
  leaveButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  leaveText: { ...Typography.body, color: Colors.textDim },
  errorBanner: {
    backgroundColor: Colors.errorDim,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.caption, color: Colors.error },
});

export default LobbyScreen;
