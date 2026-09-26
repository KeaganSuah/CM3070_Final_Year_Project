// Provides optional haptic feedback for successful and selected actions.
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

// Plays a success haptic on supported mobile devices without blocking the action.
export async function successFeedback() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* optional hardware feedback */
  }
}

// Plays a light selection haptic when the user chooses or votes for an item.
export async function selectionFeedback() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.selectionAsync();
  } catch {
    /* optional hardware feedback */
  }
}
