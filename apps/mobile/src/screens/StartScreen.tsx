import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const StartScreen: React.FC = () => {
  return (
    <ImageBackground
      source={require('../../assets/images/splash-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Stop the Bus</Text>
          <Text style={styles.subtitle}>The fast-thinking word game</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/nickname')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/how-to-play')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>How to Play</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  bus: {
    fontSize: 80,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.heading1,
    textAlign: 'center',
    color: Colors.white,
  },
  subtitle: {
    ...Typography.bodyBold,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.buttonText,
    fontSize: 20,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 18,
  },
});

export default StartScreen;
