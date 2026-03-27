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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/src/context/GameContext';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const HomeScreen: React.FC = () => {
  const { state, createRoom } = useGame();

  const { pendingJoin, error, nickname, isConnected } = state;

  const handleChangeNickname = () => {
    router.push('/nickname');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/splash-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
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
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  title: { ...Typography.heading1, textAlign: 'center', color: Colors.white },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playerName: { ...Typography.body, color: 'rgba(255,255,255,0.85)' },
  changeLink: { ...Typography.caption, color: Colors.white, textDecorationLine: 'underline' },
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
  connectionText: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
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
    gap: Spacing.md
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
