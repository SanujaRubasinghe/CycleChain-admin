'use client';
import { FiBell, FiHelpCircle, FiMenu, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DashboardHeader({ title }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button className="p-2 rounded-lg mr-4 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors lg:hidden">
            <FiMenu className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-cyan-400 relative transition-colors"
          >
            <FiBell className="text-xl" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-cyan-400 transition-colors"
          >
            <FiHelpCircle className="text-xl" />
          </motion.button>
          
          <div className="flex items-center space-x-3 ml-2">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <FiUser className="text-sm" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-white">Admin</span>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}