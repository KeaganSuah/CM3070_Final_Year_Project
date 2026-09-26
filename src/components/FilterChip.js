// Renders a reusable selectable chip for report and form filters.
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';

// Displays one reusable filter option and highlights it when selected.
export default function FilterChip({ label, active, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    gap: 8
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  label: {
    color: COLORS.text,
    fontWeight: '600'
  },
  labelActive: {
    color: '#FFFFFF'
  }
});
