// Lets web users choose an exact incident position with a Leaflet map pin.
import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Loads Leaflet styling once before the browser location picker starts.
const ensureLeafletCss = () => {
  if (document.getElementById("readis-leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "readis-leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:#1554D1;border:3px solid white;position:relative;box-shadow:0 5px 14px rgba(15,42,93,.3);transform:rotate(-45deg);"><div style="width:10px;height:10px;background:white;border-radius:50%;position:absolute;left:9px;top:9px;"></div></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Displays a browser map where the report pin can be dragged or placed.
export default function LocationPicker({ coordinate, onChange, userLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const skipNextRecentreRef = useRef(false);

  // Keeps the latest change callback available to the Leaflet drag and click handlers.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Creates the browser location picker once and connects drag and tap events.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    ensureLeafletCss();
    const map = L.map(containerRef.current).setView(
      [coordinate.latitude, coordinate.longitude],
      15,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([coordinate.latitude, coordinate.longitude], {
      draggable: true,
      icon: pinIcon,
      title: "Drag to incident location",
    }).addTo(map);

    // Sends the new browser pin coordinates to the report form without forcing a recentre.
    const notifyUserPinChange = (latitude, longitude) => {
      skipNextRecentreRef.current = true;
      onChangeRef.current?.({ latitude, longitude });
    };

    marker.on("dragend", () => {
      const next = marker.getLatLng();
      notifyUserPinChange(next.lat, next.lng);
    });

    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      notifyUserPinChange(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.invalidateSize())
        : null;

    resizeObserver?.observe(containerRef.current);

    return () => {
      window.clearTimeout(timer);
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Moves the pin when coordinates change but avoids recentring after the user drags it.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    marker.setLatLng([coordinate.latitude, coordinate.longitude]);

    if (skipNextRecentreRef.current) {
      skipNextRecentreRef.current = false;
      return;
    }

    map.setView(
      [coordinate.latitude, coordinate.longitude],
      Math.max(map.getZoom(), 14),
      { animate: true },
    );
  }, [coordinate.latitude, coordinate.longitude]);

  // Updates the optional current-location marker separately from the incident pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      userMarkerRef.current = L.circleMarker(
        [userLocation.latitude, userLocation.longitude],
        {
          radius: 7,
          color: "#FFFFFF",
          weight: 3,
          fillColor: "#2B74E8",
          fillOpacity: 1,
        },
      )
        .bindTooltip("Your current location")
        .addTo(map);
    }
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      aria-label="Choose incident location on map"
      style={{
        width: "100%",
        height: 300,
        borderRadius: 20,
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
}
