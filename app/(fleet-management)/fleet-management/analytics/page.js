'use client';
import { FiBarChart2, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const usageData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Bike Rentals',
        data: [120, 190, 130, 170, 150, 210, 240],
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
    ],
  };

  const statusData = {
    labels: ['Available', 'In Use', 'Maintenance'],
    datasets: [
      {
        data: [32, 8, 2],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
        ],
        borderWidth: 0,
      },
    ],
  };

  const stats = [
    { title: 'Total Rentals', value: '1,240', icon: <FiBarChart2 />, change: '+12%' },
    { title: 'Active Users', value: '856', icon: <FiUsers />, change: '+8%' },
    { title: 'Avg. Ride Time', value: '32 min', icon: <FiClock />, change: '+5%' },
    { title: 'Revenue', value: '$24,580', icon: <FiTrendingUp />, change: '+18%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <span>{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Usage</h2>
            <div className="h-80">
              <Bar 
                data={usageData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Bike Status Distribution</h2>
            <div className="h-80">
              <Pie 
                data={statusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}