// Shows every reported incident on the map and supports current-location discovery.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AppHeader from "../components/AppHeader";
import IncidentMap from "../components/IncidentMap";
import ReportCard from "../components/ReportCard";
import EmptyState from "../components/EmptyState";
import { DISASTER_TYPES } from "../constants/options";
import { COLORS } from "../constants/theme";
import { MAP_MARKER_COLOURS } from "../constants/map";

// Displays all report locations and shows details for the currently selected marker.
export default function MapScreen({ route, reports, onPressLike }) {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapFocusCoordinate, setMapFocusCoordinate] = useState(null);
  const [locating, setLocating] = useState(false);
  const handledFocusRef = useRef(null);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) || null,
    [reports, selectedReportId],
  );

  useEffect(() => {
    const requestedId = route?.params?.focusReportId;
    if (!requestedId) return;

    const focusIdentity = `${requestedId}-${route?.params?.focusKey || ""}`;
    if (handledFocusRef.current === focusIdentity) return;

    const requestedReport = reports.find((report) => report.id === requestedId);
    if (!requestedReport) return;

    handledFocusRef.current = focusIdentity;
    setSelectedReportId(requestedId);
    setMapFocusCoordinate({
      latitude: requestedReport.latitude,
      longitude: requestedReport.longitude,
    });
  }, [reports, route?.params?.focusKey, route?.params?.focusReportId]);

  useEffect(() => {
    if (
      selectedReportId &&
      !reports.some((report) => report.id === selectedReportId)
    ) {
      setSelectedReportId(null);
    }
  }, [reports, selectedReportId]);

  // Requests foreground location and centres the incident map on the user.
  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow location access to centre the map on your current position.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const current = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(current);
      setSelectedReportId(null);
      setMapFocusCoordinate(current);
    } catch (error) {
      Alert.alert(
        "Unable to find location",
        "Check that location services are enabled and try again.",
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader />

      <View style={styles.headingRow}>
        <View style={styles.headingTextWrap}>
          <Text style={styles.title}>Incident map</Text>
          <Text style={styles.subtitle}>
            Explore all reported incidents or centre the map on your current
            location.
          </Text>
        </View>
        <Pressable
          style={styles.locateButton}
          onPress={useCurrentLocation}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel="Find my current location on the incident map"
        >
          <Ionicons name="locate" size={19} color="#FFF" />
          <Text style={styles.locateText}>
            {locating ? "Finding…" : "Find me"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapHeader}>
        <View>
          <Text style={styles.mapCount}>
            {reports.length} mapped incident{reports.length === 1 ? "" : "s"}
          </Text>
          <Text style={styles.mapHint}>
            Tap a marker to view the matching feed report.
          </Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        {DISASTER_TYPES.slice(1).map((item) => (
          <View key={item} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: MAP_MARKER_COLOURS[item] },
              ]}
            />
            <Text style={styles.legendText}>
              {item === "Power Outage" ? "Power" : item}
            </Text>
          </View>
        ))}
      </View>

      {reports.length ? (
        <IncidentMap
          reports={reports}
          selectedReportId={selectedReportId}
          onSelectReport={(report) => {
            setSelectedReportId(report.id);
          }}
          userLocation={userLocation}
          focusCoordinate={mapFocusCoordinate}
        />
      ) : (
        <View style={styles.emptyMap}>
          <EmptyState />
        </View>
      )}

      {selectedReport && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>Selected incident</Text>
          <ReportCard
            report={selectedReport}
            onPressLike={onPressLike}
            compact
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 130 },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  headingTextWrap: { flex: 1 },
  title: { fontSize: 27, fontWeight: "900", color: COLORS.text },
  subtitle: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  locateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  locateText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  mapHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mapCount: { color: COLORS.text, fontWeight: "900", fontSize: 17 },
  mapHint: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  emptyMap: {
    minHeight: 300,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    justifyContent: "center",
  },
  selectedSection: { marginTop: 20 },
  selectedTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 10,
  },
});
