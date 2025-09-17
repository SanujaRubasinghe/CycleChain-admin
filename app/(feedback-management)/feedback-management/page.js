'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminFeedbackManagement() {
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setAllFeedbacks(data);
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setMessage('Error fetching feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      setFeedbacks(allFeedbacks);
      setMessage('');
      return;
    }
    setSearching(true);
    setMessage('');

    // Client-side filter by name (supports partial match)
    const filtered = allFeedbacks.filter(f => 
      (f.name || '').toLowerCase().includes(term.toLowerCase())
    );
    setFeedbacks(filtered);
    if (filtered.length === 0) setMessage('No feedback found for the provided name');
    setSearching(false);
  };

  const clearSearch = async () => {
    setSearchTerm('');
    setMessage('');
    setFeedbacks(allFeedbacks);
  };

  const handleDelete = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Feedback deleted successfully!');
        // Remove from both lists
        const updatedAll = allFeedbacks.filter(f => f._id !== feedbackId);
        setAllFeedbacks(updatedAll);
        const updatedVisible = feedbacks.filter(f => f._id !== feedbackId);
        setFeedbacks(updatedVisible);
      } else {
        setMessage('Failed to delete feedback');
      }
    } catch (error) {
      setMessage('Error deleting feedback');
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const handleGenerateReport = () => {
    try {
      // Create document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Feedback Report', 14, 20);
      
      // Add generated date
      doc.setFontSize(10);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 30);
      
      // Prepare data for table
      const headers = ['ID', 'Name', 'Email', 'Rating', 'Message', 'Created At'];
      
      const rows = feedbacks.map((f) => [
        f._id || '',
        f.name || '',
        f.email || '',
        `${f.rating || 0}/5`,
        (f.message || '').replace(/\s+/g, ' ').slice(0, 100),
        f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''
      ]);
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 30 },  // ID
          1: { cellWidth: 25 },  // Name
          2: { cellWidth: 30 },  // Email
          3: { cellWidth: 15 },  // Rating
          4: { cellWidth: 50 },  // Message
          5: { cellWidth: 30 }   // Created At
        }
      });
      
      // Save the PDF
      doc.save('feedback-report.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
      setMessage('Failed to generate PDF report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Admin Feedback Management
          </h1>

          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between mb-6">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Search by Name</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter name (partial or full)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="h-10 mt-6 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-800"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="h-10 mt-6 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                Clear
              </button>
            </form>

            <button
              type="button"
              onClick={handleGenerateReport}
              className="h-10 mt-2 md:mt-6 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
            >
              Generate Report (PDF)
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('successfully')
                ? 'bg-green-900 text-green-300 border border-green-700'
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              Total Feedbacks: <span className="text-white">{feedbacks.length}</span> 
              <span className="text-sm text-gray-400 ml-2">(showing {feedbacks.length} of {allFeedbacks.length})</span>
            </h2>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No feedback available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border border-gray-700 rounded-lg p-6 bg-gray-750 hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {feedback.name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-300">
                          {feedback.isAdmin ? 'Admin' : 'Client'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{feedback.email}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-400">Rating:</span>
                        <span className="text-yellow-400 text-lg">
                          {getRatingStars(feedback.rating)}
                        </span>
                        <span className="text-sm text-gray-400">({feedback.rating}/5)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-2">
                        Created: {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(feedback.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed">{feedback.message}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      User ID: {feedback.userId}
                    </div>
                    <button
                      onClick={() => handleDelete(feedback._id)}
                      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}