// Provides a simple reusable placeholder screen for unfinished or empty sections.

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import AppHeader from "../components/AppHeader";

// Displays a simple icon, title and message for a placeholder page.
export default function PlaceholderScreen({ icon, title, message }) {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={34} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    textAlign: "center",
    color: COLORS.textMuted,
    lineHeight: 22,
  },
});
