// components/maintenance/MaintenanceDashboard.js
'use client';
import { useState, useEffect } from 'react';
import MaintenanceList from '../../components/MaintenanceList';
import MaintenanceCalendar from '../../components/MaintenanceCalendar';
import TechnicianManager from '../../components/TechnicianManager';
import MaintenanceRules from '../../components/MaintenanceRules';

export default function MaintenanceDashboard() {
  const [activeTab, setActiveTab] = useState('list');
  
  const tabs = [
    { id: 'list', name: 'Maintenance List', icon: '📋' },
    { id: 'calendar', name: 'Calendar View', icon: '📅' },
    { id: 'technicians', name: 'Technicians', icon: '👨‍🔧' },
    { id: 'rules', name: 'Maintenance Rules', icon: '⚙️' }
  ];
  
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">Bike Maintenance Management</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === tab.id
                  ? 'border-b-2 border-cyan-400 text-cyan-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {activeTab === 'list' && <MaintenanceList />}
          {activeTab === 'calendar' && <MaintenanceCalendar />}
          {activeTab === 'technicians' && <TechnicianManager />}
          {activeTab === 'rules' && <MaintenanceRules />}
        </div>
      </div>
    </div>
  );
}