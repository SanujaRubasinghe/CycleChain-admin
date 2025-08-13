'use client';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, change, icon }) {
  const isPositive = change.startsWith('+');
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-green-50 text-green-600">
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{change}</span>
        <span className="ml-1">from last month</span>
      </div>
    </motion.div>
  );
}