"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Link from "next/link";
import { useBikes } from "../hooks/useBikes";
import { LuBike } from "react-icons/lu";

const CENTER = { lat: 6.9271, lng: 79.8612 };
const DEFAULT_ZOOM = 13;

const LAYERS = [
  { key: "none", label: "None" },
  { key: "pickups", label: "Pickups" },
  { key: "net-inflow", label: "Net Inflow" },
  { key: "low-battery", label: "Low Battery" },
  { key: "demand-gap", label: "Demand Gap" },
];

export default function MapWithHeatmaps() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [clusterer, setClusterer] = useState(null);
  const [activeLayer, setActiveLayer] = useState("none");
  const [range, setRange] = useState("24h");
  const { bikes } = useBikes();

  const infoWindowRef = useRef(null);

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

  // Initialize map once
  useEffect(() => {
    if (!window.google || !mapRef.current) return;
    if (mapObj.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapObj.current = map;

    // Single InfoWindow for all markers
    infoWindowRef.current = new google.maps.InfoWindow();
  }, []);

  // Add bike markers + clusterer
  useEffect(() => {
    if (!window.google || !mapObj.current || !bikes?.length) return;

    // Clear previous cluster
    if (clusterer) {
      clusterer.clearMarkers();
      setClusterer(null);
    }

    const bikeIcon = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: "#EF4444",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1,
      scale: 1.5,
      anchor: new google.maps.Point(12, 24), // anchor to bottom of icon
    };


    const markers = bikes.map((bike) => {
      const marker = new google.maps.Marker({
        position: bike.currentLocation,
        icon: bikeIcon,
        map: mapObj.current,
      });

      marker.addListener("click", () => {
        const lockStatus = bike.isLocked 
          ? `<span style="color:red; font-weight:600;">Locked 🔒</span>` 
          : `<span style="color:green; font-weight:600;">Unlocked 🔓</span>`;

        const batteryColor = bike.battery > 70 ? '#4CAF50' : bike.battery > 30 ? '#FFC107' : '#F44336';

        const content = `
          <div style="
            font-family: Arial, sans-serif; 
            min-width:220px; 
            background:white; 
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15); 
            padding:12px;
          ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h3 style="margin:0; font-size:16px; font-weight:600;color:#000">${bike.name}</h3>
              <span style="font-size:12px; color:#555;">${bike.type}</span>
            </div>

            <div style="margin-bottom:8px; font-size:12px; color:#555;">
              <div style="margin-bottom:4px;">ID: <span style="font-weight:500;">${bike.bikeId}</span></div>
              <div style="margin-bottom:4px;">Battery: 
                <span style="font-weight:500;">${bike.battery}%</span>
                <div style="background:#eee; border-radius:4px; height:6px; margin-top:2px;">
                  <div style="width:${bike.battery}%; background:${batteryColor}; height:6px; border-radius:4px;"></div>
                </div>
              </div>
              <div>Lock: ${lockStatus}</div>
            </div>

            <a href="/fleet-management/bikes/${bike.bikeId}" target="_blank" style="
              display:block; 
              text-align:center; 
              padding:6px 0; 
              background:#2E7D32; 
              color:white; 
              border-radius:6px; 
              text-decoration:none; 
              font-weight:600;
            ">Manage Bike</a>
          </div>
        `;
        
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapObj.current, marker);
      });


      return marker;
    });

    const cl = new MarkerClusterer({ map: mapObj.current, markers });
    setClusterer(cl);
  }, [bikes]);

  // Heatmap
  useEffect(() => {
    const map = mapObj.current;
    if (!map || activeLayer === "none") {
      if (clusterer) clusterer.setMap(map);
      if (heatmapLayer) heatmapLayer.setMap(null);
      return;
    }

    if (clusterer) clusterer.setMap(null);
    if (heatmapLayer) heatmapLayer.setMap(null);

    const controller = new AbortController();
    const params = new URLSearchParams({
      start: startISO,
      end: endISO,
      tauHours: tauHours.toString(),
    });

    fetch(`/api/heatmap/${activeLayer}?` + params.toString(), { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.points?.length) return;

        const data = payload.points.map((p) => ({

          location: new google.maps.LatLng(Number(p.lat), Number(p.lng)),
          weight: Number(p.weight) || 1,
        }));

        const hl = new google.maps.visualization.HeatmapLayer({
          data,
          radius: 50,
          opacity: 0.85,
        });

        hl.setMap(map);
        setHeatmapLayer(hl);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [activeLayer, startISO, endISO, tauHours, clusterer]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        {LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(l.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: activeLayer === l.key ? "#2E7D32" : "white",
              color: activeLayer === l.key ? "white" : "#111827",
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
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: range === r ? "#111827" : "white",
                color: range === r ? "white" : "#111827",
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div ref={mapRef} style={{ width: "100%", height: 600, borderRadius: 8 }} />
    </div>
  );
}
