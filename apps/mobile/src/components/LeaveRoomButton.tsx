import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

interface Props {
  onPress: () => void;
}

const LeaveRoomButton: React.FC<Props> = ({ onPress }) => (
  <TouchableOpacity style={styles.leaveButton} onPress={onPress}>
    <Text style={styles.leaveText}>Leave Room</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create(
    {
        leaveButton: { 
        backgroundColor: Colors.buttonBackgroundDark,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center'
    },
    leaveText: { ...Typography.body, color: Colors.buttonTextLight },
});

export default LeaveRoomButton;
