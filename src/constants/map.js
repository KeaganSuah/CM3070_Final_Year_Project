// Stores shared Singapore map settings, area centres and marker colours.
// Sets the initial map view around Singapore.
export const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.24,
  longitudeDelta: 0.24
};

// Provides a representative centre point for each compass region.
export const AREA_CENTERS = {
  North: { latitude: 1.4382, longitude: 103.7890 },
  'North-East': { latitude: 1.3922, longitude: 103.8950 },
  East: { latitude: 1.3450, longitude: 103.9530 },
  'South-East': { latitude: 1.3008, longitude: 103.9060 },
  South: { latitude: 1.2638, longitude: 103.8200 },
  'South-West': { latitude: 1.2835, longitude: 103.7930 },
  West: { latitude: 1.3500, longitude: 103.7060 },
  'North-West': { latitude: 1.4070, longitude: 103.7480 },
  Central: { latitude: 1.3048, longitude: 103.8318 }
};

// Keeps incident marker colours consistent across native and web maps.
export const MAP_MARKER_COLOURS = {
  Flood: '#1554D1',
  Fire: '#FF6A00',
  Storm: '#4B72D6',
  'Power Outage': '#E79228'
};

export const DEFAULT_MAP_ZOOM = 12;
