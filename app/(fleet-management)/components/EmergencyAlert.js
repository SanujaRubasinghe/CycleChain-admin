"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

// Custom red icon
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function EmergencyAlertModal() {
  const [alerts, setAlerts] = useState([]);
  const [audio] = useState(
    typeof Audio !== "undefined" ? new Audio("/alert.mp3") : null
  );

  // Poll API every 3s
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/bikes/emergencies");
        const data = await res.json();
        if (data.success) {
          setAlerts(data.emergencies);

          if (data.emergencies.length > 0 && audio) {
            audio.play().catch(() => {});
          }
        }
      } catch (err) {
        console.error("Error fetching emergencies:", err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [audio]);

  // Dismiss a single alert
  const dismissAlert = async (bikeId) => {
    await fetch("/api/bikes/emergencies", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bikeId })
    })

    if (alerts.length === 0 && audio) {
      audio.pause();
      audio.currentTime = 0; 
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-red-50 border-4 border-red-600 rounded-xl shadow-2xl w-[95%] max-w-4xl p-8 relative animate-pulse overflow-y-auto max-h-[80vh]">
        {alerts.map((latest) => (
          <div
            key={latest.bikeId}
            className="bg-white p-6 rounded-lg border-2 border-red-300 shadow-md mb-4 relative"
          >
            {/* Dismiss Button */}
            <button
              onClick={() => dismissAlert(latest.bikeId)}
              className="absolute top-4 right-4 text-red-700 hover:text-black bg-red-200 rounded-full p-2 hover:bg-red-300 transition-colors"
            >
              ✖
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-lg font-bold text-gray-800">Bike ID:</p>
                <p className="text-2xl font-black text-red-600">
                  {latest.bikeId}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Emergency Type:
                </p>
                <p className="text-2xl font-black text-red-600 uppercase">
                  {latest.type}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Time Reported:
                </p>
                <p className="text-2xl font-black text-red-600 uppercase">
                  {new Date(latest.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Leaflet Map */}
            <div className="h-96 w-full mt-4 rounded-lg overflow-hidden border-2 border-red-400">
              <MapContainer
                center={[latest.gps.lat, latest.gps.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[latest.gps.lat, latest.gps.lng]}
                  icon={redIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-red-600">🚨 Emergency</p>
                      <p>Bike ID: {latest.bikeId}</p>
                      <p>Type: {latest.type}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="font-bold text-red-800 text-center text-lg">
                🚑 EMERGENCY RESPONSE REQUIRED AT THIS LOCATION 🚑
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
