import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

const WaitingBanner: React.FC = () => (
  <View style={styles.waitingBanner}>
    <Text style={styles.waitingBannerText}>
        Waiting for the driver to start
    </Text>
  </View>
);

const styles = StyleSheet.create({
  waitingBanner: {
    backgroundColor: Colors.notification,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  waitingBannerText: { ...Typography.body, color: Colors.white },
});

export default WaitingBanner;
