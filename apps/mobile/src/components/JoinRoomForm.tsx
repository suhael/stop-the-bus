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

const JoinRoomForm: React.FC = () => {
  const { state, joinRoom, setError } = useGame();
  const [roomCode, setRoomCode] = useState('');

  const { pendingJoin, error } = state;

  const handleJoin = () => {
    if (roomCode.trim().length < 5) return;
    joinRoom(roomCode.trim());
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Join a Room</Text>
          <Text style={styles.label}>Enter the 5-character room code</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TextInput
            style={styles.codeInput}
            placeholder="XXXXX"
            placeholderTextColor={Colors.textDim}
            value={roomCode}
            onChangeText={(t) => {
              setRoomCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              if (error) setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={5}
            returnKeyType="go"
            onSubmitEditing={handleJoin}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, roomCode.length < 5 && styles.buttonDisabled]}
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
    gap: Spacing.md,
  },
  title: { ...Typography.heading2, textAlign: 'center' },
  label: { ...Typography.caption, textAlign: 'center', color: Colors.textMuted },
  errorBanner: {
    backgroundColor: Colors.errorDim,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.body, color: Colors.error },
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
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...Typography.bodyBold, color: Colors.white, fontSize: 18 },
});

export default JoinRoomForm;
