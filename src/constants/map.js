// Stores shared Singapore map settings, area centres and marker colours.
// Sets the initial map view around Singapore.
export const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.24,
  longitudeDelta: 0.24,
};

// Provides a representative centre point for each compass region.
export const AREA_CENTERS = {
  North: { latitude: 1.4382, longitude: 103.789 },
  "North-East": { latitude: 1.3922, longitude: 103.895 },
  East: { latitude: 1.345, longitude: 103.953 },
  "South-East": { latitude: 1.3008, longitude: 103.906 },
  South: { latitude: 1.2638, longitude: 103.82 },
  "South-West": { latitude: 1.2835, longitude: 103.793 },
  West: { latitude: 1.35, longitude: 103.706 },
  "North-West": { latitude: 1.407, longitude: 103.748 },
  Central: { latitude: 1.3048, longitude: 103.8318 },
};

// Keeps incident marker colours consistent across native and web maps.
export const MAP_MARKER_COLOURS = {
  Flood: "#1554D1",
  Fire: "#FF6A00",
  Storm: "#4B72D6",
  "Power Outage": "#E79228",
};

export const DEFAULT_MAP_ZOOM = 12;
