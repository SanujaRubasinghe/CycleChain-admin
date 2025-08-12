'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiUnlock, FiMapPin, FiBattery, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BikeDetail({ params }) {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBike = async () => {
    try {
      const res = await fetch(`/api/bikes/${params.id}`);
      const data = await res.json();
      setBike(data);
    } catch (error) {
      toast.error('Failed to fetch bike details');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async () => {
    try {
      const res = await fetch(`/api/bikes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !bike.isLocked })
      });
      const updatedBike = await res.json();
      setBike(updatedBike);
      toast.success(`Bike ${!bike.isLocked ? 'locked' : 'unlocked'}`);
    } catch (error) {
      toast.error('Failed to update bike status');
    }
  };

  useEffect(() => { fetchBike(); }, [params.id]);

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;
  if (!bike) return <div>Bike not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Inventory
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{bike.name}</h1>
          <p className="text-gray-500">ID: {bike.bikeId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          bike.status === 'available' ? 'bg-green-100 text-green-800' :
          bike.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {bike.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">Bike Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiBattery className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Battery Level</p>
                <p className="font-medium">{bike.battery}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCalendar className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Last Maintenance</p>
                <p className="font-medium">{new Date(bike.lastMaintenance).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">Location</h3>
          <div className="flex items-center">
            <FiMapPin className="text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Current Position</p>
              <p className="font-medium">
                {bike.currentLocation.lat.toFixed(6)}, {bike.currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Controls</h3>
        <button
          onClick={toggleLock}
          className={`w-full py-3 rounded-lg flex items-center justify-center ${
            bike.isLocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {bike.isLocked ? (
            <>
              <FiUnlock className="mr-2" /> Unlock Bike
            </>
          ) : (
            <>
              <FiLock className="mr-2" /> Lock Bike
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-3">QR Code</h3>
        <img src={bike.qrCode} alt="Bike QR Code" className="mx-auto w-48 h-48" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Scan this code to unlock the bike
        </p>
      </div>
    </div>
  );
}