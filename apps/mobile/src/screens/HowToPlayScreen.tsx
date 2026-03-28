import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const RULES: { heading: string; body: string }[] = [
  {
    heading: '🎯 Objective',
    body: 'Be the fastest player to fill every category with a word starting with the round\'s letter — then stop the bus before anyone else does!',
  },
  {
    heading: '🔤 Each Round',
    body: 'A random letter is chosen at the start of each round. Every answer must begin with that letter. There are 5 rounds in total.',
  },
  {
    heading: '⏱️ The Timer',
    body: 'You have 3 minutes to fill all your categories. The clock is ticking — don\'t overthink it!',
  },
  {
    heading: '🛑 Stopping the Bus',
    body: 'Once you\'ve filled every category, tap "Stop the Bus!" to end the round early. This triggers a 10-second scramble for all other players.',
  },
  {
    heading: '✍️ The Scramble',
    body: 'When the bus is stopped (or the 3 minutes run out), everyone gets 10 final seconds to fill in any remaining answers. Inputs are locked when the scramble ends.',
  },
  {
    heading: '🏆 Scoring',
    body:
      'Points are awarded for every valid word:\n\n• 10 pts — Unique answer (no one else wrote the same word)\n• 5 pts — Shared answer (another player wrote the same word)\n• 0 pts — Empty or invalid entry\n\nThe player who stopped the bus earns a +15 bonus on top of their score for that round. No bonus is given if the round ends by timeout.',
  },
  {
    heading: '✅ Valid Words',
    body: 'Answers are checked against a built-in dictionary. The word must start with the correct letter and exist in the dictionary for the given category.',
  },
  {
    heading: '👑 The Driver',
    body: 'One player is the Driver (host). Only the Driver can start the game. If the Driver leaves, the next player becomes the new Driver automatically.',
  },
  {
    heading: '🏁 Winning',
    body: 'After 5 rounds, scores are totalled and the final podium is revealed. The player with the most points wins. Good luck!',
  },
];

const HowToPlayScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>How to Play</Text>
        <Text style={styles.subtitle}>Stop the Bus</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {RULES.map((rule) => (
          <View key={rule.heading} style={styles.ruleCard}>
            <Text style={styles.ruleHeading}>{rule.heading}</Text>
            <Text style={styles.ruleBody}>{rule.body}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.closeButtonText}>Got it — Let's Play!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  title: { ...Typography.heading1, textAlign: 'center' },
  subtitle: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  ruleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  ruleHeading: { ...Typography.bodyBold, color: Colors.text },
  ruleBody: { ...Typography.body, color: Colors.textMuted, lineHeight: 22 },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  closeButtonText: { ...Typography.bodyBold, color: Colors.white, fontSize: 18 },
});

export default HowToPlayScreen;
