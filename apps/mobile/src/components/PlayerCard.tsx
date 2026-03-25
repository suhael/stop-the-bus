import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

interface PlayerCardProps {
  nickname: string;
  isHost: boolean;
  isYou: boolean;
  score?: number;
  compact?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  nickname,
  isHost,
  isYou,
  score,
  compact = false,
}) => {
  const initial = nickname.charAt(0).toUpperCase();

  return (
    <View style={[styles.card, compact && styles.cardCompact, isYou && styles.cardSelf]}>
      <View style={[styles.avatar, compact && styles.avatarCompact]}>
        <Text style={[styles.avatarText, compact && styles.avatarTextCompact]}>
          {initial}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.nickname, compact && styles.nicknameCompact]}
            numberOfLines={1}
          >
            {nickname}
          </Text>
          {isYou && <Text style={styles.youBadge}>you</Text>}
        </View>
        {isHost && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostText}>🚌 Driver</Text>
          </View>
        )}
      </View>

      {score !== undefined && (
        <Text style={styles.score}>{score} pts</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompact: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardSelf: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCompact: {
    width: 32,
    height: 32,
  },
  avatarText: {
    ...Typography.heading3,
    color: Colors.white,
    fontSize: 18,
  },
  avatarTextCompact: {
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nickname: {
    ...Typography.bodyBold,
  },
  nicknameCompact: {
    fontSize: 14,
  },
  youBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: Colors.errorDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  hostBadge: {
    marginTop: 2,
  },
  hostText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  score: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 18,
  },
});

export default PlayerCard;
