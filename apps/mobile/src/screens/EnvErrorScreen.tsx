import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ZodIssue } from 'zod';
import { Colors, Spacing, Typography } from '@/src/theme';

interface Props {
  errors: ZodIssue[];
}

export default function EnvErrorScreen({ errors }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Configuration Error</Text>
        <Text style={styles.subtitle}>
          The app could not start because required environment variables are
          missing or invalid. Create a{' '}
          <Text style={styles.code}>.env</Text> file inside{' '}
          <Text style={styles.code}>apps/mobile/</Text> and set the following:
        </Text>

        <View style={styles.errorBox}>
          {errors.map((issue, i) => (
            <View key={i} style={styles.errorRow}>
              <Text style={styles.errorVar}>
                {issue.path.join('.') || 'unknown'}
              </Text>
              <Text style={styles.errorMsg}>{issue.message}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.example}>Example .env</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            EXPO_PUBLIC_SERVER_URL=http://192.168.1.50:3000
          </Text>
        </View>

        <Text style={styles.hint}>
          Restart the Expo dev server after saving the{' '}
          <Text style={styles.code}>.env</Text> file for the changes to take
          effect.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  title: {
    ...Typography.heading1,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  code: {
    fontFamily: 'monospace',
    color: Colors.accent,
  },
  errorBox: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  errorRow: {
    gap: 2,
  },
  errorVar: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  errorMsg: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  example: {
    ...Typography.bodyBold,
    color: Colors.textMuted,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  codeBlock: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: Colors.accent,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});
