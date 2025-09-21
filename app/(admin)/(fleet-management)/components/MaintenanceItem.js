// components/maintenance/MaintenanceItem.js
'use client';
import { useState } from 'react';
import MaintenanceForm from './MaintenanceForm';

export default function MaintenanceItem({ record, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  
  const statusColors = {
    scheduled: 'bg-blue-600',
    in_progress: 'bg-yellow-600',
    completed: 'bg-green-600',
    cancelled: 'bg-red-600'
  };
  
  const priorityColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/fleet/maintenance/${record._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                {record.status.replace('_', ' ')}
              </span>
              <span className={`text-sm font-medium ${priorityColors[record.priority]}`}>
                {record.priority} priority
              </span>
            </div>
            
            <h3 className="font-semibold text-lg mb-1">Bike: {record.bikeId}</h3>
            <p className="text-gray-300 mb-2">{record.issue}</p>
            
            <div className="text-sm text-gray-400">
              <div className="flex space-x-4">
                <span>Type: {record.type}</span>
                <span>Scheduled: {formatDate(record.scheduled_at)}</span>
                {record.assigned_to && (
                  <span>Technician: {record.assigned_to.name}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEdit(true)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Edit
            </button>
          </div>
        </div>
        
        {/* Action buttons based on status */}
        <div className="mt-4 flex space-x-2">
          {record.status === 'scheduled' && (
            <>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Start Work
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </>
          )}
          
          {record.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Complete
            </button>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {showEdit && (
        <MaintenanceForm 
          record={record}
          onClose={() => {
            setShowEdit(false);
            onUpdate();
          }} 
        />
      )}
    </>
  );
}