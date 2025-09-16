// components/maintenance/MaintenanceList.js
'use client';
import { useState, useEffect } from 'react';
import MaintenanceItem from './MaintenanceItem';
import MaintenanceForm from './MaintenanceForm';

export default function MaintenanceList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    technician: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchRecords();
  }, [filters, pagination.page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filters.status,
        technician: filters.technician,
        search: filters.search,
        page: pagination.page,
        limit: pagination.limit
      });
      
      const response = await fetch(`/api/fleet/maintenance?${params}`);
      const data = await response.json();
      
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMaintenance = async () => {
    try {
      const response = await fetch('/api/fleet/maintenance/generate', {
        method: 'POST'
      });
      const result = await response.json();
      alert(result.message);
      fetchRecords(); 
    } catch (error) {
      console.error('Error generating maintenance:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Maintenance Records</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerateMaintenance}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Generate Maintenance
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            Add Maintenance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-gray-600 border border-gray-500 rounded-md p-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by bike ID or issue..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full bg-gray-600 border border-gray-500 rounded-md p-2 text-white"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => fetchRecords()}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="text-center py-8">Loading maintenance records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No maintenance records found</div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <MaintenanceItem 
              key={record._id} 
              record={record} 
              onUpdate={fetchRecords} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              disabled={pagination.page === 1}
              className="bg-gray-700 disabled:opacity-50 text-white px-3 py-1 rounded-md"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination({...pagination, page})}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === page 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              disabled={pagination.page === pagination.pages}
              className="bg-gray-700 disabled:opacity-50 text-white px-3 py-1 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Form Modal */}
      {showForm && (
        <MaintenanceForm 
          onClose={() => {
            setShowForm(false);
            fetchRecords();
          }} 
        />
      )}
    </div>
  );
}