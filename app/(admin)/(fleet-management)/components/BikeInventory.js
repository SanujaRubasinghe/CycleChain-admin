'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUnlock, FiRefreshCw, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BikeInventory() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/bikes');
      if (!res.ok) throw new Error('Failed to fetch bikes');
      const data = await res.json();
      setBikes(data);
    } catch (error) {
      console.error('Error fetching bikes:', error);
      setError(error.message);
      toast.error('Failed to fetch bikes');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (bikeId, name, currentLockStatus) => {
    try {
      const res = await fetch(`/api/bikes/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLockStatus, name: name })
      });
      
      if (!res.ok) throw new Error('Failed to update bike status');
      
      const updatedBike = await res.json();
      setBikes(bikes.map(b => b.bikeId === bikeId ? updatedBike : b));
      toast.success(`Bike ${!currentLockStatus ? 'locked' : 'unlocked'}`);
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('Failed to update bike status');
    }
  };

  useEffect(() => { 
    fetchBikes(); 
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-64 text-gray-400">
      <FiAlertCircle className="text-4xl text-rose-400 mb-4" />
      <h3 className="text-lg font-medium">Failed to load bikes</h3>
      <p className="mb-4">{error}</p>
      <button 
        onClick={fetchBikes}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bike Inventory</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your fleet of bikes</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={fetchBikes}
            className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          <Link 
            href="/dashboard/bikes/add" 
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" /> Add New Bike
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <motion.div 
            key={bike.bikeId}
            whileHover={{ y: -5 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{bike.name}</h3>
                  <p className="text-sm text-gray-400">ID: {bike.bikeId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  bike.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  bike.status === 'in_use' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {bike.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <div className="p-2 bg-gray-700 rounded-md mr-3">
                    <LuBike className="text-cyan-400" />
                  </div>
                  <span>Type: {bike.type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <div className="p-2 bg-gray-700 rounded-md mr-3">
                    {bike.isLocked ? 
                      <FiLock className="text-green-400" /> : 
                      <FiUnlock className="text-rose-400" />
                    }
                  </div>
                  <span>Lock: {bike.isLocked ? 'Engaged' : 'Disengaged'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                <Link 
                  href={`/dashboard/bikes/${bike.bikeId}`}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => toggleLock(bike.bikeId, bike.name, bike.isLocked)}
                  className={`p-2 rounded-full transition-colors ${
                    bike.isLocked 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {bike.isLocked ? <FiUnlock /> : <FiLock />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {bikes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <LuBike className="text-4xl text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-300">No bikes found</h3>
          <p className="text-gray-500 mt-1">Get started by adding your first bike</p>
          <Link 
            href="/dashboard/bikes/add" 
            className="inline-flex items-center mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" /> Add New Bike
          </Link>
        </div>
      )}
    </div>
  );
}