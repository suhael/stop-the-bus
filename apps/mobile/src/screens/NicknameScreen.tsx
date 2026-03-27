import React, { useState } from 'react';
import {
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
import { sanitizeNickname } from '@/src/utils/format';

const NicknameScreen: React.FC = () => {
  const { setNicknameAndProceed } = useGame();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    const clean = sanitizeNickname(input.trim());
    if (clean.length < 2) {
      setError('Nickname must be at least 2 letters or numbers.');
      return;
    }
    setError('');
    await setNicknameAndProceed(clean);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.bus}>🚌</Text>
          <Text style={styles.title}>Stop the Bus</Text>
          <Text style={styles.subtitle}>Enter a nickname to get on board</Text>

          <TextInput
            style={[styles.input, !!error && styles.inputError]}
            placeholder="Your nickname"
            placeholderTextColor={Colors.textDim}
            value={input}
            onChangeText={(t) => {
              setInput(t);
              if (error) setError('');
            }}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, !input.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>All Aboard!</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  bus: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.heading1,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.input,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 20,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: Colors.buttonBackground,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.buttonText,
    fontSize: 18,
  },
});

export default NicknameScreen;
