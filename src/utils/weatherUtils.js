// Selects the nearest NEA forecast and chooses a matching weather icon.
// Calculates a simple squared coordinate distance for comparing nearby forecast areas.
export function distanceSquared(a, b) {
  return ((a.latitude - b.latitude) ** 2) + ((a.longitude - b.longitude) ** 2);
}

// Selects the NEA forecast area closest to the supplied map coordinate.
export function selectNearestForecast(payload, coordinate) {
  const data = payload?.data;
  const metadata = Array.isArray(data?.area_metadata) ? data.area_metadata : [];
  const item = Array.isArray(data?.items) ? data.items[0] : null;
  const forecasts = Array.isArray(item?.forecasts) ? item.forecasts : [];

  if (!coordinate || !metadata.length || !forecasts.length) return null;

  const nearest = metadata.reduce((best, area) => {
    const point = area?.label_location;
    if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return best;
    const distance = distanceSquared(coordinate, point);
    return !best || distance < best.distance ? { area, distance } : best;
  }, null);

  if (!nearest) return null;
  const forecast = forecasts.find((entry) => entry.area === nearest.area.name);
  if (!forecast) return null;

  return {
    area: forecast.area,
    forecast: forecast.forecast,
    updateTimestamp: item.update_timestamp || item.timestamp || null,
    validPeriod: item.valid_period || null,
    coordinate: nearest.area.label_location
  };
}

// Chooses a simple weather icon from the forecast description.
export function weatherIconName(forecast = '') {
  const text = String(forecast).toLowerCase();
  if (text.includes('thunder')) return 'thunderstorm-outline';
  if (text.includes('rain') || text.includes('showers')) return 'rainy-outline';
  if (text.includes('cloud')) return 'cloud-outline';
  if (text.includes('fair') || text.includes('sun')) return 'sunny-outline';
  if (text.includes('wind')) return 'flag-outline';
  return 'partly-sunny-outline';
}
