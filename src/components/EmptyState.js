// Shows a clear message when no reports match the current filters.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Displays a helpful empty result message when no reports are available.
export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
      <Text style={styles.title}>No matching reports</Text>
      <Text style={styles.subtitle}>Try another location, search term, or disaster filter.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginTop: 12
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    color: COLORS.textMuted,
    lineHeight: 20
  }
});
