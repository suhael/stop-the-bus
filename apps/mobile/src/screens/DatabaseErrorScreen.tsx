// apps/mobile/src/screens/DatabaseErrorScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DatabaseErrorScreenProps {
  error: string;
}

export default function DatabaseErrorScreen({ error }: DatabaseErrorScreenProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>⚠️ Database Error</Text>
      <Text style={styles.errorText}>
        Failed to load game.db. Please ensure the file is bundled in your assets folder.
      </Text>
      <Text style={styles.errorDetails}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 24, 
    backgroundColor: "#f8d7da" 
  },
  errorTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#721c24", 
    marginBottom: 10 
  },
  errorText: { 
    fontSize: 16, 
    color: "#721c24",
    marginBottom: 12,
    lineHeight: 22
  },
  errorDetails: {
    fontSize: 14,
    color: "#a94442",
    fontFamily: "monospace",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 8,
    borderRadius: 4
  }
});