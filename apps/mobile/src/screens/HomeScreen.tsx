import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/src/context/GameContext';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const HomeScreen: React.FC = () => {
  const { state, createRoom, joinRoom, changeNickname, setError } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'home' | 'join'>('home');

  const { pendingJoin, error, nickname, isConnected } = state;

  const handleJoin = () => {
    if (roomCode.trim().length < 5) return;
    joinRoom(roomCode.trim());
  };

  const handleChangeNickname = async () => {
    // Cycle back to nickname screen
    await changeNickname();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.bus}>🚌</Text>
            <Text style={styles.title}>Stop the Bus</Text>
            <View style={styles.playerRow}>
              <Text style={styles.playerName}>Hey, {nickname}!</Text>
              <TouchableOpacity onPress={handleChangeNickname}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.connectionDot}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isConnected ? Colors.success : Colors.error },
                ]}
              />
              <Text style={styles.connectionText}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Actions */}
          {mode === 'home' ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={createRoom}
                disabled={pendingJoin}
                activeOpacity={0.8}
              >
                {pendingJoin ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Create Room</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setMode('join')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actions}>
              <Text style={styles.joinLabel}>Enter the 5-character room code</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="XXXXX"
                placeholderTextColor={Colors.textDim}
                value={roomCode}
                onChangeText={(t) => setRoomCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={5}
                returnKeyType="go"
                onSubmitEditing={handleJoin}
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  roomCode.length < 5 && styles.buttonDisabled,
                ]}
                onPress={handleJoin}
                disabled={roomCode.length < 5 || pendingJoin}
                activeOpacity={0.8}
              >
                {pendingJoin ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Board the Bus</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setMode('home');
                  setRoomCode('');
                  setError(null);
                }}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bus: { fontSize: 60 },
  title: { ...Typography.heading1, textAlign: 'center' },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playerName: { ...Typography.body, color: Colors.textMuted },
  changeLink: { ...Typography.caption, color: Colors.primary, textDecorationLine: 'underline' },
  connectionDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: { ...Typography.caption },
  errorBanner: {
    backgroundColor: Colors.errorDim,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.body, color: Colors.error },
  actions: { gap: Spacing.md },
  primaryButton: {
    backgroundColor: Colors.buttonBackground,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.buttonBackgroundDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...Typography.bodyBold, color: Colors.buttonText, fontSize: 18 },
  secondaryButtonText: { ...Typography.bodyBold, color: Colors.buttonTextLight, fontSize: 18 },
  joinLabel: { ...Typography.caption, textAlign: 'center' },
  codeInput: {
    backgroundColor: Colors.input,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.heading2,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  backButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  backText: { ...Typography.body, color: Colors.textMuted },
});

export default HomeScreen;
