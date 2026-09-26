// Renders incident markers with the native map component on iOS and Android.
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MAP_MARKER_COLOURS, SINGAPORE_REGION } from '../constants/map';

// Displays native report markers while keeping the user free to pan and zoom.
export default function IncidentMap({
  reports,
  selectedReportId,
  onSelectReport,
  userLocation,
  focusCoordinate
}) {
  const mapRef = useRef(null);
  const initialFitCompleteRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Fits the native map to all current report markers only on the first ready load.
  useEffect(() => {
    if (!ready || !mapRef.current || initialFitCompleteRef.current || !reports.length) {
      return;
    }

    if (reports.length === 1) {
      mapRef.current.animateToRegion({
        latitude: reports[0].latitude,
        longitude: reports[0].longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035
      }, 0);
    } else {
      mapRef.current.fitToCoordinates(
        reports.map((report) => ({
          latitude: report.latitude,
          longitude: report.longitude
        })),
        {
          edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
          animated: false
        }
      );
    }

    initialFitCompleteRef.current = true;
  }, [ready, reports]);

  // Moves the map only when another screen asks it to focus on a specific coordinate.
  useEffect(() => {
    if (!ready || !mapRef.current || !focusCoordinate) return;

    mapRef.current.animateToRegion({
      latitude: focusCoordinate.latitude,
      longitude: focusCoordinate.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025
    }, 350);
  }, [focusCoordinate, ready]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={SINGAPORE_REGION}
        onMapReady={() => setReady(true)}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        accessibilityLabel="Map of reported incidents"
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude
            }}
            title={report.type}
            description={`${report.location} · ${report.severity}`}
            pinColor={MAP_MARKER_COLOURS[report.type] || '#1554D1'}
            onPress={() => onSelectReport?.(report)}
            zIndex={report.id === selectedReportId ? 10 : 1}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 480,
    borderRadius: 22,
    overflow: 'hidden'
  },
  map: {
    width: '100%',
    height: '100%'
  }
});
