// components/maintenance/TechnicianManager.js
'use client';
import { useState, useEffect } from 'react';

export default function TechnicianManager() {
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fleet/technicians');
      const data = await response.json();
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this technician?')) return;
    
    try {
      const response = await fetch(`/api/fleet/technicians/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchTechnicians();
      }
    } catch (error) {
      console.error('Error deleting technician:', error);
    }
  };

  const statusColors = {
    available: 'bg-green-600',
    busy: 'bg-yellow-600',
    on_leave: 'bg-red-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Technician Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
        >
          Add Technician
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading technicians...</div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No technicians found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map(tech => (
            <div key={tech._id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{tech.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[tech.status]}`}>
                  {tech.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-sm text-gray-300 space-y-1">
                <p>Email: {tech.email}</p>
                {tech.phone && <p>Phone: {tech.phone}</p>}
                <p>Specialization: {tech.specialization}</p>
                <p>Active tasks: {tech.active_tasks}</p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingTech(tech)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tech._id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technician Form Modal */}
      {showForm || editingTech ? (
        <TechnicianForm 
          technician={editingTech}
          onClose={() => {
            setShowForm(false);
            setEditingTech(null);
            fetchTechnicians();
          }} 
        />
      ) : null}
    </div>
  );
}

// Technician Form Component
function TechnicianForm({ technician, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'general',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name,
        email: technician.email,
        phone: technician.phone || '',
        specialization: technician.specialization,
        status: technician.status
      });
    }
  }, [technician]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = technician 
        ? `/api/fleet/technicians/${technician._id}`
        : '/api/fleet/technicians';
      
      const method = technician ? 'PUT' : 'POST';
      
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
        console.error('Error saving technician');
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
          {technician ? 'Edit Technician' : 'Add New Technician'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="general">General</option>
              <option value="mechanical">Mechanical</option>
              <option value="electrical">Electrical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="on_leave">On Leave</option>
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