'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUnlock, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BikeInventory() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/bikes');
      const data = await res.json();
      setBikes(data);
    } catch (error) {
      toast.error('Failed to fetch bikes');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (bikeId, currentLockStatus) => {
    try {
      const res = await fetch(`/api/bikes/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLockStatus })
      });
      const updatedBike = await res.json();
      setBikes(bikes.map(b => b.bikeId === bikeId ? updatedBike : b));
      toast.success(`Bike ${!currentLockStatus ? 'locked' : 'unlocked'}`);
    } catch (error) {
      toast.error('Failed to update bike status');
    }
  };

  useEffect(() => { fetchBikes(); }, []);

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Bike Inventory</h2>
        <Link href="/dashboard/bikes/add" className="btn-primary">
          <FiPlus className="mr-2" /> Add New Bike
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <motion.div 
            key={bike.bikeId}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{bike.name}</h3>
                  <p className="text-sm text-gray-500">ID: {bike.bikeId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bike.status === 'available' ? 'bg-green-100 text-green-800' :
                  bike.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bike.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <LuBike className="mr-2" />
                  <span>Type: {bike.type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiLock className="mr-2" />
                  <span>Lock: {bike.isLocked ? 'Engaged' : 'Disengaged'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                <Link 
                  href={`/dashboard/bikes/${bike.bikeId}`}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  View Details
                </Link>
                <button
                  onClick={() => toggleLock(bike.bikeId, bike.isLocked)}
                  className={`p-2 rounded-full ${
                    bike.isLocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {bike.isLocked ? <FiUnlock /> : <FiLock />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}