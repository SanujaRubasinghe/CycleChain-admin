"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";
import { useBikes } from "../hooks/useBikes";

// Fix default marker icons in Next.js
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const CENTER = [6.9271, 79.8612]; // Colombo
const DEFAULT_ZOOM = 13;

const LAYERS = [
  { key: "none", label: "None" },
  { key: "pickups", label: "Pickups" },
  { key: "net-inflow", label: "Net Inflow" },
  { key: "low-battery", label: "Low Battery" },
  { key: "demand-gap", label: "Demand Gap" },
];

export default function MapWithHeatmaps() {
  const { bikes } = useBikes();
  const [activeLayer, setActiveLayer] = useState("none");
  const [range, setRange] = useState("24h");

  const { startISO, endISO, tauHours } = useMemo(() => {
    const end = new Date();
    let start = new Date(end.getTime() - 24 * 3600 * 1000);
    if (range === "3h") start = new Date(end.getTime() - 3 * 3600 * 1000);
    if (range === "7d") start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      tauHours: range === "3h" ? 6 : range === "7d" ? 48 : 24,
    };
  }, [range]);

  // Custom bike icon
  const bikeIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" fill="#EF4444" width="28" height="28" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5
      s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  return (
    <div style={{ position: "relative", width: "100%", height: 600 }}>
      {/* 🗺️ Map */}
      <MapContainer
        center={CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Clustered Markers */}
        {activeLayer === "none" && (
          <MarkerClusterGroup>
            {bikes.map((bike) => {
              const batteryColor =
                bike.battery > 70 ? "#4CAF50" : bike.battery > 30 ? "#FFC107" : "#F44336";

              return (
                <Marker
                  key={bike.bikeId}
                  position={[bike.currentLocation.lat, bike.currentLocation.lng]}
                  icon={bikeIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 220 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#000" }}>
                        {bike.name}
                      </h3>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        ID: <strong>{bike.bikeId}</strong>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        Battery: <strong>{bike.battery}%</strong>
                        <div style={{ background: "#eee", borderRadius: 4, height: 6 }}>
                          <div
                            style={{
                              width: `${bike.battery}%`,
                              background: batteryColor,
                              height: 6,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        Lock:{" "}
                        {bike.isLocked ? (
                          <span style={{ color: "red", fontWeight: 600 }}>Locked 🔒</span>
                        ) : (
                          <span style={{ color: "green", fontWeight: 600 }}>Unlocked 🔓</span>
                        )}
                      </div>
                      <a
                        href={`/fleet-management/bikes/${bike.bikeId}`}
                        target="_blank"
                        style={{
                          display: "block",
                          textAlign: "center",
                          marginTop: 8,
                          padding: "6px 0",
                          background: "#2E7D32",
                          color: "white",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Manage Bike
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* Heatmap */}
        {activeLayer !== "none" && (
          <HeatmapLayer
            activeLayer={activeLayer}
            startISO={startISO}
            endISO={endISO}
            tauHours={tauHours}
          />
        )}
      </MapContainer>

      {/* 🎛️ Overlay Controls */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "white",
          padding: 8,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          zIndex: 1000,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          maxWidth: "calc(100% - 20px)",
        }}
      >
        {LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(l.key)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: activeLayer === l.key ? "#2E7D32" : "white",
              color: activeLayer === l.key ? "white" : "#111827",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {l.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["3h", "24h", "7d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: range === r ? "#111827" : "white",
                color: range === r ? "white" : "#111827",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Heatmap Layer Component
 */
function HeatmapLayer({ activeLayer, startISO, endISO, tauHours }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatLayer = L.heatLayer([], {
      radius: 35,
      blur: 20,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.1: "blue",
        0.3: "lime",
        0.6: "yellow",
        0.9: "red",
      },
    }).addTo(map);

    const controller = new AbortController();
    const params = new URLSearchParams({
      start: startISO,
      end: endISO,
      tauHours: tauHours.toString(),
    });

    fetch(`/api/fleet/heatmap/${activeLayer}?` + params.toString(), { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.points?.length) return;
        const data = payload.points.map((p) => [Number(p.lat), Number(p.lng), Number(p.weight) || 1]);
        heatLayer.setLatLngs(data);
      })
      .catch(() => {});

    return () => {
      controller.abort();
      map.removeLayer(heatLayer);
    };
  }, [map, activeLayer, startISO, endISO, tauHours]);

  return null;
}
