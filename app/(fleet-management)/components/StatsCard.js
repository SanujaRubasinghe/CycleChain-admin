'use client';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, change, icon }) {
  const isPositive = change.startsWith('+');
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-gray-600"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-rose-400'}`}>
        <span className="font-medium">{change}</span>
        <span className="ml-2 text-gray-400">from last month</span>
      </div>
    </motion.div>
  );
}