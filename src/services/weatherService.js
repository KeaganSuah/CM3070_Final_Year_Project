// Fetches NEA weather data and falls back to a local cache when needed.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { selectNearestForecast } from "../utils/weatherUtils";

// Uses Singapore data.gov.sg for the two-hour weather forecast.
const WEATHER_URL =
  "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast";
const CACHE_KEY = "@readis_nea_weather_cache_v1";
// Treats cached weather as fresh for fifteen minutes.
const CACHE_TTL_MS = 15 * 60 * 1000;

// Reads the last saved NEA weather response from local storage.
async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Stores a fresh NEA weather response with the time it was cached.
async function writeCache(payload) {
  const value = { payload, cachedAt: Date.now() };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(value));
  return value;
}

// Selects the nearest forecast from cached API data and adds source information.
function derive(cache, coordinate, extras = {}) {
  const selected = selectNearestForecast(cache?.payload, coordinate);
  return selected ? { ...selected, cachedAt: cache.cachedAt, ...extras } : null;
}

// Returns live NEA weather when possible and falls back to cached data when needed.
export async function getWeatherForCoordinate(
  coordinate,
  { force = false } = {},
) {
  const cache = await readCache();
  const fresh = cache && Date.now() - cache.cachedAt < CACHE_TTL_MS;

  if (!force && fresh) {
    return derive(cache, coordinate, {
      source: "cache",
      stale: false,
      offline: false,
    });
  }

  let network;
  try {
    network = await Network.getNetworkStateAsync();
  } catch {
    network = { isConnected: true, isInternetReachable: true };
  }

  const offline =
    network?.isConnected === false || network?.isInternetReachable === false;
  if (offline) {
    if (cache)
      return derive(cache, coordinate, {
        source: "cache",
        stale: true,
        offline: true,
      });
    throw new Error("OFFLINE_NO_CACHE");
  }

  try {
    const response = await fetch(WEATHER_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`WEATHER_HTTP_${response.status}`);
    const payload = await response.json();
    if (payload?.code !== 0 || !payload?.data)
      throw new Error("WEATHER_INVALID_RESPONSE");
    const saved = await writeCache(payload);
    return derive(saved, coordinate, {
      source: "live",
      stale: false,
      offline: false,
    });
  } catch (error) {
    if (cache)
      return derive(cache, coordinate, {
        source: "cache",
        stale: true,
        offline: false,
        error: error.message,
      });
    throw error;
  }
}

export { WEATHER_URL, CACHE_TTL_MS };
