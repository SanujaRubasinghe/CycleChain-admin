// components/maintenance/MaintenanceRules.js
'use client';
import { useState, useEffect } from 'react';

export default function MaintenanceRules() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fleet/maintenance/rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching maintenance rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const response = await fetch(`/api/fleet/maintenance/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      const response = await fetch(`/api/fleet/maintenance/rules/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Maintenance Rules</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm md:text-base"
        >
          Add Rule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No maintenance rules found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule._id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{rule.name}</h3>
                <div className="flex items-center">
                  <span className="mr-2 text-xs">Active</span>
                  <button
                    onClick={() => handleToggle(rule._id, rule.is_active)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      rule.is_active ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                        rule.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {rule.description && (
                <p className="text-gray-300 mb-3 text-sm">{rule.description}</p>
              )}
              
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Bike Type:</span>
                  <span className="text-gray-300 capitalize">{rule.bike_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trigger:</span>
                  <span className="text-gray-300 capitalize">{rule.trigger_type}</span>
                </div>
                {rule.mileage_interval && (
                  <div className="flex justify-between">
                    <span>Mileage:</span>
                    <span className="text-gray-300">{rule.mileage_interval} miles</span>
                  </div>
                )}
                {rule.time_interval_days && (
                  <div className="flex justify-between">
                    <span>Time Interval:</span>
                    <span className="text-gray-300">{rule.time_interval_days} days</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Maintenance:</span>
                  <span className="text-gray-300 capitalize">{rule.maintenance_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span className="text-gray-300 capitalize">{rule.priority}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingRule(rule)}
                  className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule Form Modal */}
      {showForm || editingRule ? (
        <RuleForm 
          rule={editingRule}
          onClose={() => {
            setShowForm(false);
            setEditingRule(null);
            fetchRules();
          }} 
        />
      ) : null}
    </div>
  );
}

// Rule Form Component
function RuleForm({ rule, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bike_type: 'city',
    trigger_type: 'mileage',
    mileage_interval: 100,
    time_interval_days: 30,
    maintenance_type: 'routine',
    priority: 'medium',
    estimated_duration: 60,
    parts_required: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description || '',
        bike_type: rule.bike_type,
        trigger_type: rule.trigger_type,
        mileage_interval: rule.mileage_interval || 100,
        time_interval_days: rule.time_interval_days || 30,
        maintenance_type: rule.maintenance_type,
        priority: rule.priority,
        estimated_duration: rule.estimated_duration || 60,
        parts_required: rule.parts_required?.join(', ') || '',
        is_active: rule.is_active
      });
    }
  }, [rule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        parts_required: formData.parts_required.split(',').map(p => p.trim()).filter(p => p)
      };
      
      const url = rule 
        ? `/api/fleet/maintenance/rules/${rule._id}`
        : '/api/fleet/maintenance/rules';
      
      const method = rule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        onClose();
      } else {
        console.error('Error saving rule');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">
            {rule ? 'Edit Maintenance Rule' : 'Add New Maintenance Rule'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name *</label>
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bike Type *</label>
                <select
                  name="bike_type"
                  value={formData.bike_type}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="city">City Bike</option>
                  <option value="mountain">Mountain Bike</option>
                  <option value="electric">Electric Bike</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trigger Type *</label>
                <select
                  name="trigger_type"
                  value={formData.trigger_type}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="mileage">Mileage</option>
                  <option value="time">Time</option>
                  <option value="combination">Combination</option>
                </select>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {formData.trigger_type !== 'time' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mileage Interval (miles) *</label>
                  <input
                    type="number"
                    name="mileage_interval"
                    value={formData.mileage_interval}
                    onChange={handleChange}
                    min="1"
                    required={formData.trigger_type !== 'time'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  />
                </div>
              )}
              
              {formData.trigger_type !== 'mileage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Time Interval (days) *</label>
                  <input
                    type="number"
                    name="time_interval_days"
                    value={formData.time_interval_days}
                    onChange={handleChange}
                    min="1"
                    required={formData.trigger_type !== 'mileage'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Type *</label>
                <select
                  name="maintenance_type"
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="routine">Routine</option>
                  <option value="inspection">Inspection</option>
                  <option value="battery">Battery</option>
                  <option value="tire">Tire</option>
                  <option value="brake">Brake</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Full width fields */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parts Required (comma separated)</label>
              <input
                type="text"
                name="parts_required"
                value={formData.parts_required}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                placeholder="e.g., brake pads, chain, battery"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-2 w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm">Active Rule</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? 'Saving...' : 'Save Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}