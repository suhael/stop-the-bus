import React from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/src/context/GameContext';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';
import { HUD_HEIGHT } from '../components/GameHUD';

const HomeScreen: React.FC = () => {
  const { state, createRoom } = useGame();

  const { pendingJoin, error } = state;

  return (
    <ImageBackground
      source={require('../../assets/images/splash-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Translucent status bar so the image bleeds behind the system clock row */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* SafeAreaView includes top so content starts below the transparent HUD overlay.
          AppShell has already added HUD_HEIGHT to the top inset via SafeAreaInsetsContext. */}
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Stop the Bus</Text>
        </View>
        <View style={styles.footer}>
          {/* Error */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

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
            onPress={() => router.push('/join')}
            activeOpacity={0.8}
            >
            <Text style={styles.secondaryButtonText}>Join Room</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + HUD_HEIGHT,
    gap: Spacing.sm,
  },
  title: { ...Typography.heading1, textAlign: 'center', color: Colors.white },
  errorBanner: {
    backgroundColor: Colors.errorDim,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.body, color: Colors.error },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
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
  buttonText: { ...Typography.bodyBold, color: Colors.buttonText, fontSize: 18 },
  secondaryButtonText: { ...Typography.bodyBold, color: Colors.buttonTextLight, fontSize: 18 },
});

export default HomeScreen;
