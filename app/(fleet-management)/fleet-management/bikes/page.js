'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUnlock, FiRefreshCw, FiPlus, FiEdit2, FiChevronDown } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BikeInventory() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  const fetchBikes = async () => {
    try {
      setLoading(true);
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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBikes = [...bikes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  useEffect(() => { fetchBikes(); }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bike Fleet Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={fetchBikes}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          <Link href="/fleet-management/bikes/add" className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
            <FiPlus className="mr-2" /> Add New Bike
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Bike Name
                    <FiChevronDown className={`ml-1 transition-transform ${sortConfig.key === 'name' && sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    <FiChevronDown className={`ml-1 transition-transform ${sortConfig.key === 'type' && sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <FiChevronDown className={`ml-1 transition-transform ${sortConfig.key === 'status' && sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lock
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBikes.map((bike) => (
                <motion.tr 
                  key={bike.bikeId}
                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <LuBike className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{bike.bikeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{bike.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bike.status === 'available' ? 'bg-green-100 text-green-800' :
                      bike.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bike.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleLock(bike.bikeId, bike.isLocked)}
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        bike.isLocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {bike.isLocked ? <FiLock className="mr-1" /> : <FiUnlock className="mr-1" />}
                      {bike.isLocked ? 'Locked' : 'Unlocked'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/fleet-management/bikes/${bike.bikeId}`}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}