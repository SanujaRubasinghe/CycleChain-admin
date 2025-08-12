'use client';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useBikes } from '../hooks/useBikes';
import { FiBike, FiHome } from 'react-icons/fi';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function BikeMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
  const { bikes, loading } = useBikes();
  const [selectedBike, setSelectedBike] = useState(null);

  if (!isLoaded || loading) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={center}
      options={{
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      {bikes.map((bike) => (
        <MarkerF
          key={bike.id}
          position={bike.location}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: bike.status === 'available' ? '#10B981' : '#EF4444',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 1.5,
          }}
          onClick={() => setSelectedBike(bike)}
        />
      ))}

      {selectedBike && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 max-w-xs">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-full ${selectedBike.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <FiHome />
            </div>
            <div>
              <h3 className="font-semibold">{selectedBike.name}</h3>
              <p className={`text-sm ${selectedBike.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                {selectedBike.status.charAt(0).toUpperCase() + selectedBike.status.slice(1)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Battery: {selectedBike.battery}%</p>
          <p className="text-sm text-gray-600">Last Maintenance: {selectedBike.lastMaintenance}</p>
          <button 
            onClick={() => setSelectedBike(null)}
            className="mt-3 text-sm text-green-600 hover:text-green-800"
          >
            Close
          </button>
        </div>
      )}
    </GoogleMap>
  );
}