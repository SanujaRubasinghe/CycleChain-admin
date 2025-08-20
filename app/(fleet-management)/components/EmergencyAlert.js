"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

export default function EmergencyAlertModal() {
  const [emergencies, setEmergencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [audio] = useState(
    typeof Audio !== "undefined" ? new Audio("/alert.mp3") : null
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/bikes/emergencies");
      const data = await res.json();

      if (data.success) {
        setEmergencies(data.emergencies);

        if (data.emergencies.length > 0) {
          setShowModal(true);
          if (audio) audio.play().catch(() => {});
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [audio]);

  if (!showModal || emergencies.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-red-50 border-4 border-red-600 rounded-xl shadow-2xl w-[95%] max-w-4xl p-8 relative animate-pulse">
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-red-700 hover:text-black bg-red-200 rounded-full p-2 hover:bg-red-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-600 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-red-700 uppercase tracking-wide">
            Emergency Alert!
          </h2>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
          {emergencies.map((e) => (
            <div key={e.bikeId} className="bg-white p-6 rounded-lg border-2 border-red-300 shadow-md">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-800">Bike ID:</p>
                  <p className="text-2xl font-black text-red-600">{e.bikeId}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">Emergency Type:</p>
                  <p className="text-2xl font-black text-red-600 uppercase">{e.type}</p>
                </div>
              </div>

              <div className="h-96 w-full mt-4 rounded-lg overflow-hidden border-2 border-red-400">
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  center={{ lat: e.location.lat, lng: e.location.lng }}
                  zoom={15}
                >
                  <Marker 
                    position={{ lat: e.location.lat, lng: e.location.lng }} 
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                </GoogleMap>
              </div>

              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="font-bold text-red-800 text-center text-lg">
                  🚑 EMERGENCY RESPONSE REQUIRED AT THIS LOCATION 🚑
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-red-600 rounded-lg">
          <p className="text-white text-center font-bold text-xl animate-pulse">
            ⚠️ IMMEDIATE ATTENTION REQUIRED ⚠️
          </p>
        </div>
      </div>
    </div>
  );
}