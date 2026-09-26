// Shows quiz results, earned readiness points and an optional review reminder.
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import AppHeader from "../components/AppHeader";
import { scheduleGuideReviewReminder } from "../services/notificationService";
import { successFeedback } from "../utils/deviceFeedback";

// Displays the completed quiz result and the readiness points earned.
export default function GuideResultScreen({ route, navigation }) {
  const { result, guideId } = route.params;
  const [reminderState, setReminderState] = useState("idle");
  const percentage = Math.round(
    (result.score / Math.max(result.totalQuestions, 1)) * 100,
  );
  const message =
    percentage >= 80
      ? "Excellent work. Your readiness score increased strongly."
      : percentage >= 50
        ? "Good job. Keep reading more guides to build readiness."
        : "Nice try. Review the guide and try again to improve your score.";

  // Schedules a local reminder so the user can review the guide the next day.
  const scheduleReminder = async () => {
    setReminderState("busy");
    try {
      const response = await scheduleGuideReviewReminder({
        guideId,
        title: result.title,
      });
      if (response.status === "unsupported") {
        Alert.alert(
          "Mobile feature",
          "Readiness reminders are available in the iOS and Android app.",
        );
        setReminderState("idle");
        return;
      }
      if (response.status === "denied") {
        Alert.alert(
          "Notifications are off",
          "You can enable notifications in your device settings and try again.",
        );
        setReminderState("idle");
        return;
      }
      await successFeedback();
      setReminderState("scheduled");
    } catch {
      Alert.alert(
        "Reminder not scheduled",
        "Readis could not schedule the reminder on this device.",
      );
      setReminderState("idle");
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="school-outline" size={38} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Quiz result</Text>
        <Text style={styles.score}>
          {result.score}/{result.totalQuestions}
        </Text>
        <Text style={styles.subscore}>{percentage}% correct</Text>
        <View style={styles.pointsPill}>
          <Text style={styles.pointsText}>
            +{result.pointsEarned} readiness points
          </Text>
        </View>
        <Text style={styles.message}>{message}</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Root", { screen: "Profile" })}
        >
          <Text style={styles.primaryText}>View profile</Text>
        </Pressable>
        <Pressable
          style={styles.reminderButton}
          onPress={scheduleReminder}
          disabled={reminderState === "busy" || reminderState === "scheduled"}
          accessibilityRole="button"
          accessibilityLabel="Schedule a guide review reminder for tomorrow"
        >
          <Ionicons
            name={
              reminderState === "scheduled"
                ? "checkmark-circle"
                : "notifications-outline"
            }
            size={19}
            color={COLORS.primary}
          />
          <Text style={styles.reminderText}>
            {reminderState === "scheduled"
              ? "Reminder set for tomorrow"
              : reminderState === "busy"
                ? "Scheduling…"
                : Platform.OS === "web"
                  ? "Mobile reminder"
                  : "Remind me tomorrow"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Root", { screen: "Guides" })}
        >
          <Text style={styles.secondaryText}>Back to guides</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 18,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginTop: 18, fontSize: 26, fontWeight: "900", color: COLORS.text },
  score: {
    marginTop: 12,
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.primary,
  },
  subscore: { fontSize: 18, fontWeight: "700", color: COLORS.textMuted },
  pointsPill: {
    marginTop: 18,
    backgroundColor: "#EEF8F3",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pointsText: { color: COLORS.success, fontWeight: "800", fontSize: 16 },
  message: {
    marginTop: 18,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    paddingVertical: 15,
  },
  primaryText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  reminderButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    flexDirection: "row",
    gap: 8,
  },
  reminderText: { color: COLORS.primary, fontWeight: "800", fontSize: 15 },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    paddingVertical: 15,
  },
  secondaryText: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
});
