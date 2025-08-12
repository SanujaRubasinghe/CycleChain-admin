'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBikes } from '../../hooks/useBikes';
import BikeCard from '../../components/BikeCard';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function BikesPage() {
  const { bikes, loading } = useBikes();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredBikes = bikes.filter(bike =>
    bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bike.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Bike Fleet</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bikes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/fleet-management/bikes/add')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Bike</span>
            </motion.button>
          </div>
        </div>

        {filteredBikes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No bikes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike, index) => (
              <motion.div
                key={bike.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BikeCard bike={bike} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}