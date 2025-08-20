'use client';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useBikes } from '../hooks/useBikes';
import { FiHome, FiX, FiUnlock, FiMapPin, FiLock } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import Link from 'next/link';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function BikeMap() {
  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  // });
  const { bikes, loading } = useBikes();
  const [selectedBike, setSelectedBike] = useState(null);


  // if (!isLoaded || loading) return <div>Loading...</div>;

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
          key={bike.bikeId}
          position={bike.currentLocation}
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
        <div className="absolute top-1 right-4 bg-white p-6 rounded-xl shadow-xl z-10 w-80 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${
                selectedBike.status === 'available' ? 'bg-green-100 text-green-600' :
                selectedBike.status === 'in_use' ? 'bg-blue-100 text-blue-600' :
                selectedBike.status === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                <LuBike className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{selectedBike.name}</h3>
                <p className={`text-xs font-medium ${
                  selectedBike.status === 'available' ? 'text-green-600' :
                  selectedBike.status === 'in_use' ? 'text-blue-600' :
                  selectedBike.status === 'maintenance' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {selectedBike.status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedBike(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Bike Info Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bike Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bike ID</p>
                  <p className="font-medium">{selectedBike.bikeId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedBike.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lock Status</p>
                  <p className="font-medium">
                    {selectedBike.isLocked ? (
                      <span className="text-red-600 flex items-center">
                        <FiLock className="mr-1" /> Locked
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center">
                        <FiUnlock className="mr-1" /> Unlocked
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(selectedBike.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Technical Details</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Battery Level</span>
                    <span className="font-medium">{selectedBike.battery}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedBike.battery > 70 ? 'bg-green-500' :
                        selectedBike.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedBike.battery}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Last Maintenance</p>
                  <p className="font-medium">
                    {new Date(selectedBike.lastMaintenance).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
              <div className="flex items-center text-sm space-x-2">
                <FiMapPin className="text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Coordinates</p>
                  <p className="font-medium">
                    {selectedBike.currentLocation.lat.toFixed(6)}, {selectedBike.currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps?q=${selectedBike.currentLocation.lat},${selectedBike.currentLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                View on Google Maps →
              </a>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <Link
              href={`/fleet-management/bikes/${selectedBike.bikeId}`}
              className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Manage Bike
            </Link>
          </div>
        </div>
      )}
    </GoogleMap>
  );
}