// Handles notification permission, nearby incident alerts and guide reminders.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { haversineDistanceKm } from "../utils/distanceUtils";

// Defines how local notifications are shown while Readis is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Provides safe default alert settings until the user changes them.
export const DEFAULT_NOTIFICATION_PREFS = {
  enabled: false,
  nearbyIncidents: true,
  newGuides: true,
  radiusKm: 3,
};

// Creates the Android notification channels used by Readis alerts.
export async function prepareNotificationChannels() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("nearby-incidents", {
      name: "Nearby incidents",
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync("guide-updates", {
      name: "Guide updates",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync("readiness", {
      name: "Readiness reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch {}
}

// Requests operating-system notification permission only when the user enables alerts.
export async function requestNotificationPermission() {
  if (Platform.OS === "web") return { status: "unsupported" };
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted")
    status = (await Notifications.requestPermissionsAsync()).status;
  if (status === "granted") await prepareNotificationChannels();
  return { status };
}

// Schedules a local notification immediately after checking permission.
async function immediate(content, channelId) {
  if (Platform.OS === "web") return { status: "unsupported" };
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") return { status: "denied" };
  await prepareNotificationChannels();
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      ...content,
      ...(Platform.OS === "android" ? { android: { channelId } } : {}),
    },
    trigger: null,
  });
  return { status: "scheduled", identifier };
}

// Shows a local alert when a newly synchronised guide becomes available.
export async function notifyNewGuide(guide) {
  return immediate(
    {
      title: "New Readis guide",
      body: `${guide.title} has been added to the guide library.`,
      data: { route: "GuideDetail", guideId: guide.id },
    },
    "guide-updates",
  );
}

// Checks the user’s location and alerts only when an incident is inside the chosen radius.
export async function notifyNearbyIncident(report, radiusKm = 3) {
  if (Platform.OS === "web") return { status: "unsupported" };
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted") return { status: "location-denied" };
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 5 * 60 * 1000,
      requiredAccuracy: 500,
    });
    const pos =
      lastKnown ||
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    const user = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
    const distanceKm = haversineDistanceKm(user, report);
    if (distanceKm > radiusKm) return { status: "outside-radius", distanceKm };
    return immediate(
      {
        title: `${report.type} reported nearby`,
        body: `${report.location} is about ${distanceKm.toFixed(1)} km from you. Tap to view it on the map.`,
        data: { route: "Map", reportId: report.id },
      },
      "nearby-incidents",
    );
  } catch {
    return { status: "location-error" };
  }
}

// Schedules a next-day reminder to review a completed guide.
export async function scheduleGuideReviewReminder({ guideId, title }) {
  if (Platform.OS === "web") return { status: "unsupported" };
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") return { status: "denied" };
  await prepareNotificationChannels();
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Readis readiness reminder",
      body: `Review “${title}” tomorrow to keep the safety steps fresh.`,
      data: { route: "GuideDetail", guideId },
    },
    trigger: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return { status: "scheduled", identifier };
}

// Listens for notification taps and passes the saved navigation data to the app.
export function addNotificationTapListener(handler) {
  if (Platform.OS === "web") return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener((response) =>
    handler?.(response.notification.request.content.data || {}),
  );
}

// Reads notification navigation data that launched or reopened the app.
export async function getInitialNotificationData() {
  if (Platform.OS === "web") return null;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification?.request?.content?.data || null;
  } catch {
    return null;
  }
}
