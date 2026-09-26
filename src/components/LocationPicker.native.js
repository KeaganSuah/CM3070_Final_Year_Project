// Lets mobile users choose an exact incident position by tapping or dragging a map pin.
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Displays a draggable native pin for choosing the exact incident location.
export default function LocationPicker({ coordinate, onChange, userLocation }) {
  const mapRef = useRef(null);
  const skipNextRecentreRef = useRef(false);

  useEffect(() => {
    if (skipNextRecentreRef.current) {
      skipNextRecentreRef.current = false;
      return;
    }

    mapRef.current?.animateToRegion({
      ...coordinate,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025
    }, 300);
  }, [coordinate.latitude, coordinate.longitude]);

  // Passes a dragged or tapped pin position back to the report form.
  const handleUserPinChange = (nextCoordinate) => {
    skipNextRecentreRef.current = true;
    onChange(nextCoordinate);
  };

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        }}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        onPress={(event) => handleUserPinChange(event.nativeEvent.coordinate)}
        accessibilityLabel="Choose incident location on map"
      >
        <Marker
          coordinate={coordinate}
          draggable
          pinColor="#1554D1"
          onDragEnd={(event) => handleUserPinChange(event.nativeEvent.coordinate)}
          title="Incident location"
          description="Drag this pin to the exact location"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 300, borderRadius: 20, overflow: 'hidden' },
  map: { width: '100%', height: '100%' }
});
