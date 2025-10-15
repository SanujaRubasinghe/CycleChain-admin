// components/maintenance/MaintenanceForm.js
'use client';
import { useState, useEffect } from 'react';

export default function MaintenanceForm({ record, onClose }) {
  const [formData, setFormData] = useState({
    // bike_id: '',
    bikeId: '',
    scheduled_at: new Date().toISOString().split('T')[0],
    type: 'routine',
    priority: 'medium',
    issue: '',
    assigned_to: ''
  });
  
  const [technicians, setTechnicians] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        // bike_id: record.bike_id?._id || record.bike_id || '',
        bikeId: record.bikeId || '',
        scheduled_at: record.scheduled_at ? new Date(record.scheduled_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: record.type || 'routine',
        priority: record.priority || 'medium',
        issue: record.issue || '',
        assigned_to: record.assigned_to?._id || record.assigned_to || ''
      });
    }
    
    fetchTechnicians();
    fetchBikes();
  }, [record]);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/fleet/technicians');
      let data = await response.json();
      data = data.filter(d => d.status === 'available')
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchBikes = async () => {
    try {
      const response = await fetch('/api/fleet/bikes'); 
      const data = await response.json();
      setBikes(data);
    } catch (error) {
      console.error('Error fetching bikes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = record 
        ? `/api/fleet/maintenance/${record._id}`
        : '/api/fleet/maintenance/post';
      
      const method = record ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onClose();
      } else {
        console.error('Error saving maintenance record');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {record ? 'Edit Maintenance' : 'Add New Maintenance'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bike</label>
            <select
              name="bikeId"
              value={formData.bikeId}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="">Select a bike</option>
              {bikes.map(bike => (
                <option key={bike._id} value={bike.bikeId}>
                  {bike.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Date</label>
            <input
              type="date"
              name="scheduled_at"
              value={formData.scheduled_at}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Maintenance Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="routine">Routine Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="battery">Battery Service</option>
              <option value="tire">Tire Service</option>
              <option value="brake">Brake Service</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Issue Description</label>
            <textarea
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
              placeholder="Describe the maintenance needed..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Assign to Technician</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="">Unassigned</option>
              {technicians.map(tech => ( 
                <option key={tech._id} value={tech._id}>
                  {tech.name} ({tech.specialization})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}