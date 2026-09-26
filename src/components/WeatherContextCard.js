// Shows nearby NEA weather information with live and cached fallback states.
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { AREA_CENTERS } from "../constants/map";
import { getWeatherForCoordinate } from "../services/weatherService";
import { weatherIconName } from "../utils/weatherUtils";

// Formats the weather update time into a short readable label.
function formatUpdate(value) {
  if (!value) return "recent update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recent update";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Loads and displays weather context for the selected Singapore area.
export default function WeatherContextCard({ selectedArea = "All" }) {
  const coordinate = useMemo(
    () =>
      AREA_CENTERS[selectedArea === "All" ? "Central" : selectedArea] ||
      AREA_CENTERS.Central,
    [selectedArea],
  );
  const [state, setState] = useState({
    loading: true,
    weather: null,
    error: null,
  });

  // Refreshes weather data and records a readable error if the request fails.
  const load = async (force = false) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const weather = await getWeatherForCoordinate(coordinate, { force });
      setState({ loading: false, weather, error: null });
    } catch (error) {
      setState({ loading: false, weather: null, error: error.message });
    }
  };

  // Reloads weather context when the selected area moves to a different coordinate.
  useEffect(() => {
    load(false);
  }, [coordinate.latitude, coordinate.longitude]);

  if (state.loading && !state.weather) {
    return (
      <View
        style={styles.card}
        accessibilityLabel="Loading NEA weather context"
      >
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.loading}>Loading local weather context…</Text>
      </View>
    );
  }

  if (!state.weather) {
    return (
      <View style={styles.card}>
        <Ionicons
          name="cloud-offline-outline"
          size={24}
          color={COLORS.textMuted}
        />
        <View style={styles.body}>
          <Text style={styles.title}>Weather context unavailable</Text>
          <Text style={styles.meta}>
            Readis will keep your saved reports available offline.
          </Text>
        </View>
        <Pressable
          onPress={() => load(true)}
          accessibilityRole="button"
          accessibilityLabel="Retry weather update"
        >
          <Ionicons name="refresh" size={22} color={COLORS.primary} />
        </Pressable>
      </View>
    );
  }

  const weather = state.weather;
  const statusLabel = weather.offline
    ? "Cached · offline"
    : weather.stale
      ? "Cached fallback"
      : weather.source === "live"
        ? "Live NEA data"
        : "Cached NEA data";

  return (
    <View
      style={styles.card}
      accessibilityLabel={`NEA weather near ${weather.area}: ${weather.forecast}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={weatherIconName(weather.forecast)}
          size={27}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{statusLabel}</Text>
        <Text style={styles.title}>
          {weather.area}: {weather.forecast}
        </Text>
        <Text style={styles.meta}>
          2-hour forecast · updated {formatUpdate(weather.updateTimestamp)}
        </Text>
      </View>
      <Pressable
        onPress={() => load(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Refresh NEA weather"
      >
        <Ionicons name="refresh-outline" size={21} color={COLORS.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  title: { marginTop: 2, color: COLORS.text, fontSize: 15, fontWeight: "800" },
  meta: { marginTop: 3, color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  loading: { color: COLORS.textMuted, flex: 1, fontSize: 13 },
});
