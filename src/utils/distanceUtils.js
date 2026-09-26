// Provides geographical distance helpers for nearby incident alerts.
// Uses the mean Earth radius for Haversine distance calculations.
const EARTH_RADIUS_KM = 6371;
// Converts degrees to radians for geographical distance calculations.
const toRadians = (value) => (value * Math.PI) / 180;

// Calculates the great-circle distance between two latitude and longitude points.
export function haversineDistanceKm(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const lat1 = Number(a.latitude); const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude); const lon2 = Number(b.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s));
}

// Checks whether two coordinates fall within the selected alert radius.
export function isWithinRadiusKm(a, b, radiusKm = 3) {
  return haversineDistanceKm(a, b) <= radiusKm;
}
