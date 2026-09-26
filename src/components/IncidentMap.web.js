// Renders incident markers with Leaflet when Readis runs in a web browser.
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { MAP_MARKER_COLOURS, SINGAPORE_REGION } from "../constants/map";

// Loads the Leaflet stylesheet once before the browser map is created.
const ensureLeafletCss = () => {
  if (document.getElementById("readis-leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "readis-leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

const TYPE_SYMBOLS = {
  Flood: "≈",
  Fire: "●",
  Storm: "ϟ",
  "Power Outage": "⚡",
};

// Builds a coloured Leaflet marker icon for the report type and selection state.
const makeMarkerIcon = (type, selected) =>
  L.divIcon({
    className: "",
    html: `<div style="width:${selected ? 38 : 32}px;height:${selected ? 38 : 32}px;border-radius:50%;background:${MAP_MARKER_COLOURS[type] || "#1554D1"};border:3px solid white;box-shadow:0 4px 12px rgba(15,42,93,.28);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:17px;">${TYPE_SYMBOLS[type] || "!"}</div>`,
    iconSize: [selected ? 38 : 32, selected ? 38 : 32],
    iconAnchor: [selected ? 19 : 16, selected ? 38 : 32],
    popupAnchor: [0, -34],
  });

// Builds safe popup content for one incident without injecting report text as HTML.
const createPopup = (report) => {
  const wrap = document.createElement("div");
  wrap.style.minWidth = "180px";

  const title = document.createElement("strong");
  title.textContent = `${report.type} · ${report.severity}`;

  const location = document.createElement("div");
  location.textContent = report.location;
  location.style.marginTop = "4px";

  const description = document.createElement("div");
  description.textContent = report.description;
  description.style.marginTop = "5px";
  description.style.color = "#56627f";

  wrap.append(title, location, description);
  return wrap;
};

// Displays and updates browser map markers without recreating the whole map.
export default function IncidentMap({
  reports,
  selectedReportId,
  onSelectReport,
  userLocation,
  focusCoordinate,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const reportLayerRef = useRef(null);
  const userLayerRef = useRef(null);
  const markerRefs = useRef(new Map());
  const reportDataRef = useRef(new Map());
  const onSelectRef = useRef(onSelectReport);
  const initialFitCompleteRef = useRef(false);

  // Keeps the latest report-selection callback available to existing Leaflet markers.
  useEffect(() => {
    onSelectRef.current = onSelectReport;
  }, [onSelectReport]);

  // Creates the Leaflet map once and cleans it up when the component is removed.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    ensureLeafletCss();
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([SINGAPORE_REGION.latitude, SINGAPORE_REGION.longitude], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    reportLayerRef.current = L.layerGroup().addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 100);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.invalidateSize())
        : null;

    resizeObserver?.observe(containerRef.current);

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      markerRefs.current.clear();
      reportDataRef.current.clear();
      map.remove();
      mapRef.current = null;
      reportLayerRef.current = null;
      userLayerRef.current = null;
      initialFitCompleteRef.current = false;
    };
  }, []);

  // Updates report markers in place so pins stay stable while the user explores the map.
  useEffect(() => {
    const map = mapRef.current;
    const layer = reportLayerRef.current;
    if (!map || !layer) return;

    const nextIds = new Set(reports.map((report) => report.id));
    reportDataRef.current = new Map(
      reports.map((report) => [report.id, report]),
    );

    markerRefs.current.forEach((marker, reportId) => {
      if (!nextIds.has(reportId)) {
        layer.removeLayer(marker);
        markerRefs.current.delete(reportId);
      }
    });

    reports.forEach((report) => {
      const selected = report.id === selectedReportId;
      let marker = markerRefs.current.get(report.id);

      if (!marker) {
        marker = L.marker([report.latitude, report.longitude], {
          icon: makeMarkerIcon(report.type, selected),
          keyboard: true,
          title: `${report.type}: ${report.location}`,
        });

        marker.on("click", () => {
          const latestReport = reportDataRef.current.get(report.id);
          if (latestReport) onSelectRef.current?.(latestReport);
        });

        marker.addTo(layer);
        markerRefs.current.set(report.id, marker);
      } else {
        marker.setLatLng([report.latitude, report.longitude]);
        marker.setIcon(makeMarkerIcon(report.type, selected));
      }

      marker.unbindPopup();
      marker.bindPopup(createPopup(report));

      if (selected) {
        marker.openPopup();
      }
    });

    if (!initialFitCompleteRef.current && reports.length) {
      const coordinates = reports.map((report) => [
        report.latitude,
        report.longitude,
      ]);

      if (coordinates.length === 1) {
        map.setView(coordinates[0], 14, { animate: false });
      } else {
        map.fitBounds(coordinates, {
          padding: [45, 45],
          maxZoom: 14,
          animate: false,
        });
      }

      initialFitCompleteRef.current = true;
    }

    window.setTimeout(() => map.invalidateSize(), 30);
  }, [reports, selectedReportId]);

  // Recentres only when another screen supplies an explicit focus coordinate.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusCoordinate) return;

    map.setView([focusCoordinate.latitude, focusCoordinate.longitude], 15, {
      animate: true,
    });
  }, [focusCoordinate]);

  // Updates the separate user-location marker without rebuilding incident markers.
  useEffect(() => {
    const layer = userLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!userLocation) return;

    L.circleMarker([userLocation.latitude, userLocation.longitude], {
      radius: 8,
      color: "#FFFFFF",
      weight: 3,
      fillColor: "#2B74E8",
      fillOpacity: 1,
    })
      .bindTooltip("Your current location")
      .addTo(layer);
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      aria-label="Map of reported incidents"
      style={{
        width: "100%",
        height: 480,
        borderRadius: 22,
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
}
