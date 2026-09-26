// Tests nearest-weather selection and weather icon mapping.
import { selectNearestForecast, weatherIconName } from "../utils/weatherUtils";

const fixture = {
  data: {
    area_metadata: [
      {
        name: "Woodlands",
        label_location: { latitude: 1.436, longitude: 103.786 },
      },
      {
        name: "Tampines",
        label_location: { latitude: 1.353, longitude: 103.944 },
      },
    ],
    items: [
      {
        update_timestamp: "2026-08-14T01:00:00+08:00",
        forecasts: [
          { area: "Woodlands", forecast: "Light Rain" },
          { area: "Tampines", forecast: "Partly Cloudy" },
        ],
      },
    ],
  },
};

// Checks nearest NEA forecast selection and the icon chosen for common weather descriptions.
describe("NEA weather selection", () => {
  test("selects nearest forecast by coordinates", () => {
    const result = selectNearestForecast(fixture, {
      latitude: 1.438,
      longitude: 103.789,
    });
    expect(result.area).toBe("Woodlands");
    expect(result.forecast).toBe("Light Rain");
  });
  test("returns null for malformed payload", () =>
    expect(
      selectNearestForecast({}, { latitude: 1, longitude: 1 }),
    ).toBeNull());
  test("maps rain to a rainy icon", () =>
    expect(weatherIconName("Light Rain")).toBe("rainy-outline"));
  test("maps thunder to thunderstorm icon", () =>
    expect(weatherIconName("Thundery Showers")).toBe("thunderstorm-outline"));
});
