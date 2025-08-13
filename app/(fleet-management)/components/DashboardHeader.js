'use client';
import { FiBell, FiHelpCircle, FiMenu, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DashboardHeader({ title }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button className="p-2 rounded-lg mr-4 text-gray-600 hover:bg-gray-100 lg:hidden">
            <FiMenu className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative"
          >
            <FiBell className="text-xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiHelpCircle className="text-xl" />
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FiUser />
            </div>
            <span className="hidden md:inline text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}