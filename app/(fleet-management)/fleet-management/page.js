'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiBike, FiMap, FiPieChart, FiPlus } from 'react-icons/fi';
import DashboardHeader from '../components/DashboardHeader';
import BikeMap from '../components/BikeMap';
import StatsCard from '../components/StatsCard';
import AnalyticsPage from './analytics/page';
import MapWithHeatmaps from '../components/MapWithHeatmaps';
import GoogleMapsLoader from '../components/GoogleMapsLoader';



export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('map');

  const stats = [
    { title: 'Total Bikes', value: '42', change: '+5%', icon: <FiHome /> },
    { title: 'Available', value: '32', change: '+12%', icon: <FiHome /> },
    { title: 'In Use', value: '8', change: '-3%', icon: <FiHome /> },
    { title: 'Maintenance', value: '2', change: '0%', icon: <FiHome /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Fleet Overview" />
      
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Live Bike Locations</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'map' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <FiMap className="text-lg" />
                <span>Map View</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'analytics' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <FiPieChart className="text-lg" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[500px] rounded-lg overflow-hidden"
            >
              <GoogleMapsLoader>
                <MapWithHeatmaps />
              </GoogleMapsLoader>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[500px]"
            >
              {/* Analytics charts would go here */}
              <AnalyticsPage />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}