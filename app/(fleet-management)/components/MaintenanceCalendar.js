// components/maintenance/MaintenanceCalendar.js
'use client';
import { useState, useEffect } from 'react';

export default function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [currentDate]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Fetch all records for the current month
      const response = await fetch('/api/fleet/maintenance?status=all&limit=100');
      const data = await response.json();
      setRecords(data.records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getRecordsForDate = (date) => {
    return records.filter(record => {
      const recordDate = new Date(record.scheduled_at);
      return (
        recordDate.getDate() === date.getDate() &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add cells for each day of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push(date);
  }

  const statusColors = {
    scheduled: 'bg-blue-600',
    in_progress: 'bg-yellow-600',
    completed: 'bg-green-600',
    cancelled: 'bg-red-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Maintenance Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            ←
          </button>
          <span className="text-lg font-medium">{formatDate(currentDate)}</span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading calendar...</div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 rounded-lg border border-gray-600 ${
                  date ? 'bg-gray-800' : 'bg-gray-900'
                }`}
              >
                {date && (
                  <>
                    <div className="text-right font-medium mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getRecordsForDate(date).map(record => (
                        <div
                          key={record._id}
                          className={`text-xs p-1 rounded ${statusColors[record.status]} truncate`}
                          title={`${record.bikeId}: ${record.issue}`}
                        >
                          {record.bikeId}: {record.type}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}