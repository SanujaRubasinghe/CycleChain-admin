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
        backgroundColor: '#06B6D4', // Cyan
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
          '#10B981', // Green
          '#3B82F6', // Blue
          '#F59E0B', // Amber
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

  // Chart options with dark theme
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#D1D5DB', // gray-300
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF', // gray-400
        },
        grid: {
          color: '#374151', // gray-700
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF', // gray-400
        },
        grid: {
          color: '#374151', // gray-700
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#D1D5DB', // gray-300
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-400">
                <span className="font-medium">{stat.change}</span>
                <span className="ml-2 text-gray-400">from last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Monthly Usage</h2>
            <div className="h-80">
              <Bar 
                data={usageData} 
                options={barOptions}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Bike Status Distribution</h2>
            <div className="h-80">
              <Pie 
                data={statusData} 
                options={pieOptions}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}