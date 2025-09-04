'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiMap, FiPieChart, FiPlus } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import StatsCard from '../components/StatsCard';
import MapWithHeatmapsWrapper from '../components/MapWithHeatmapsWrapper'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [stats, setStats] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("api/bikes/analytics")
        const data = await res.json()

        setStats([
          { title: "Total Bikes", value: data.totalBikes, change: "+5%", icon: <LuBike /> },
          { title: "Available", value: data.available, change: "+12%", icon: <FiHome /> },
          { title: "In Use", value: data.inUse, change: "-3%", icon: <FiHome /> },
          { title: "Maintenance", value: data.maintenance, change: "0%", icon: <FiHome /> },
        ])
      } catch (error) {
        console.error("Failed to load analytics")
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
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

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Live Bike Locations</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeTab === 'map' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FiMap className="text-lg" />
                <span>Map View</span>
              </button>
              {/* <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FiPieChart className="text-lg" />
                <span>Analytics</span>
              </button> */}
            </div>
          </div>

          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[500px] rounded-lg overflow-hidden border border-gray-700"
            >
              <MapWithHeatmapsWrapper/>
            </motion.div>
          )}

          {/* {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[500px]"
            >
              <AnalyticsPage />
            </motion.div>
          )} */}
        </div>
      </div>
    </div>
  );
}