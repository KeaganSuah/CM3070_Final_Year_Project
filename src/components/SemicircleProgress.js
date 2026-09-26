// Draws the readiness gauge used to show preparedness progress on the profile.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ARC_SIZE = 270;
const STROKE = 18;
const RADIUS = (ARC_SIZE - STROKE) / 2;
const CENTER = ARC_SIZE / 2;

// Draws the readiness arc, score marker and current preparedness tier.
export default function SemicircleProgress({
  value = 0,
  points = 0,
  delta = 0,
  label = "Prepared",
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = Math.PI * (1 - clamped / 100);
  const markerX = CENTER + RADIUS * Math.cos(angle);
  const markerY = CENTER - RADIUS * Math.sin(angle);

  return (
    <View style={styles.wrapper}>
      <View style={styles.arcWrap}>
        <View style={styles.arcTrack} />
        <View style={[styles.arcSegment, styles.arcSegmentLeft]} />
        <View style={[styles.arcSegment, styles.arcSegmentMid]} />
        <View style={[styles.arcSegment, styles.arcSegmentRight]} />
        <View
          style={[styles.marker, { left: markerX - 12, top: markerY - 12 }]}
        />
      </View>

      <View style={styles.deltaRow}>
        <View style={styles.deltaTriangle} />
        <Text style={styles.deltaText}>+{delta} pts this quiz</Text>
      </View>

      <Text style={styles.scoreValue}>{clamped}</Text>
      <Text style={styles.scoreLabel}>Readiness score</Text>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>{label}</Text>
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>0</Text>
        <Text style={styles.scaleText}>50</Text>
        <Text style={styles.scaleText}>100</Text>
      </View>

      <Text style={styles.pointsText}>{points} readiness points earned</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: "100%",
  },
  arcWrap: {
    width: ARC_SIZE,
    height: 154,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
  arcTrack: {
    position: "absolute",
    width: ARC_SIZE,
    height: ARC_SIZE,
    borderRadius: ARC_SIZE / 2,
    borderWidth: STROKE,
    borderColor: "#E6E9F4",
    borderBottomWidth: 0,
    top: 18,
  },
  arcSegment: {
    position: "absolute",
    width: ARC_SIZE,
    height: ARC_SIZE,
    borderRadius: ARC_SIZE / 2,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
    borderRightWidth: STROKE,
    borderBottomWidth: 0,
    top: 18,
  },
  arcSegmentLeft: {
    borderTopColor: "#1F7AE0",
    borderLeftColor: "#1F7AE0",
    borderRightColor: "transparent",
    transform: [{ rotate: "-8deg" }],
  },
  arcSegmentMid: {
    borderTopColor: "#4CC3FF",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  arcSegmentRight: {
    borderTopColor: "#25C98A",
    borderLeftColor: "transparent",
    borderRightColor: "#25C98A",
    transform: [{ rotate: "8deg" }],
  },
  marker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 5,
    borderColor: "#2C6CFF",
    shadowColor: "#0A1B4D",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  deltaRow: {
    marginTop: -18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deltaTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#30D38B",
  },
  deltaText: {
    fontSize: 16,
    color: "#5B6C97",
    fontWeight: "800",
  },
  scoreValue: {
    fontSize: 68,
    lineHeight: 72,
    fontWeight: "900",
    color: "#061033",
    marginTop: 4,
  },
  scoreLabel: {
    marginTop: 2,
    fontSize: 18,
    color: "#6F7EA6",
    fontWeight: "700",
  },
  labelPill: {
    marginTop: 12,
    backgroundColor: "#EAF1FF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  labelText: {
    color: "#1554D1",
    fontWeight: "900",
    fontSize: 16,
  },
  scaleRow: {
    width: 250,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  scaleText: {
    color: "#93A0C0",
    fontSize: 16,
    fontWeight: "800",
  },
  pointsText: {
    marginTop: 12,
    color: "#24345F",
    fontSize: 15,
    fontWeight: "700",
  },
});
