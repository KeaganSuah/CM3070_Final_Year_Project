// Normalises Singapore regions and repairs missing or older report coordinates.
import { AREAS } from "../constants/options";
import { AREA_CENTERS } from "../constants/map";

const LEGACY_AREA_MAP = {
  tampines: "East",
  "pasir ris": "East",
  bedok: "East",
  changi: "East",
  geylang: "South-East",
  "marine parade": "South-East",
  katong: "South-East",
  "paya lebar": "South-East",
  serangoon: "North-East",
  hougang: "North-East",
  punggol: "North-East",
  sengkang: "North-East",
  "ang mo kio": "North-East",
  bishan: "North-East",
  woodlands: "North",
  yishun: "North",
  sembawang: "North",
  admiralty: "North",
  "choa chu kang": "North-West",
  "bukit panjang": "North-West",
  mandai: "North-West",
  jurong: "West",
  clementi: "West",
  "bukit batok": "West",
  "boon lay": "West",
  sentosa: "South",
  harbourfront: "South",
  marina: "South",
  queenstown: "South-West",
  "bukit merah": "South-West",
  "telok blangah": "South-West",
  orchard: "Central",
  novena: "Central",
  newton: "Central",
  "river valley": "Central",
  "city hall": "Central",
  downtown: "Central",
  central: "Central",
  east: "East",
  west: "West",
  north: "North",
  south: "South",
  "south-east": "South-East",
  southeast: "South-East",
  "south-west": "South-West",
  southwest: "South-West",
  "north-east": "North-East",
  northeast: "North-East",
  "north-west": "North-West",
  northwest: "North-West",
};

// Checks that a coordinate value is a real finite number.
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Maps older neighbourhood names and region labels into the current compass areas.
export function normalizeArea(area, location = "", postalCode = "") {
  if (AREAS.includes(area)) return area;
  const haystack = [area, location, postalCode]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const [key, value] of Object.entries(LEGACY_AREA_MAP)) {
    if (haystack.includes(key)) return value;
  }
  return "Central";
}

// Checks whether a report already contains usable latitude and longitude values.
export function hasValidCoordinates(item = {}) {
  return isNumber(item.latitude) && isNumber(item.longitude);
}

// Creates a repeatable small coordinate offset from a report identifier.
function stableOffset(seed = "") {
  const text = String(seed);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const latitudeOffset = ((Math.abs(hash) % 17) - 8) * 0.0015;
  const longitudeOffset = ((Math.abs(Math.floor(hash / 17)) % 17) - 8) * 0.0015;
  return { latitudeOffset, longitudeOffset };
}

// Generates stable fallback coordinates for older reports without map positions.
export function getFallbackCoordinates(area = "Central", seed = "") {
  const centre = AREA_CENTERS[area] || AREA_CENTERS.Central;
  const { latitudeOffset, longitudeOffset } = stableOffset(seed);
  return {
    latitude: centre.latitude + latitudeOffset,
    longitude: centre.longitude + longitudeOffset,
  };
}

// Finds the nearest compass region centre for a latitude and longitude pair.
export function getClosestArea(latitude, longitude) {
  if (!isNumber(latitude) || !isNumber(longitude)) return "Central";

  return Object.entries(AREA_CENTERS).reduce(
    (closest, [area, point]) => {
      const distance =
        (point.latitude - latitude) ** 2 + (point.longitude - longitude) ** 2;
      return distance < closest.distance ? { area, distance } : closest;
    },
    { area: "Central", distance: Number.POSITIVE_INFINITY },
  ).area;
}

// Normalises each report area and repairs missing coordinates without changing its ID.
export function normalizeReports(reports = []) {
  return reports.map((report) => {
    const area = normalizeArea(report.area, report.location, report.postalCode);
    const coordinates = hasValidCoordinates(report)
      ? { latitude: report.latitude, longitude: report.longitude }
      : getFallbackCoordinates(area, report.id || report.location);

    return {
      ...report,
      area,
      ...coordinates,
    };
  });
}
