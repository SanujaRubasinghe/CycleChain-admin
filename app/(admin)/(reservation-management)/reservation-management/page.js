"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

// Real API functions to connect to your backend
const fetchReservations = async () => {
    try {
        const response = await fetch('/api/reservation');
        if (!response.ok) {
            throw new Error('Failed to fetch reservations');
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        if (Array.isArray(data)) {
            return data;
        }

        if (data && typeof data === 'object') {
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    return data[key];
                }
            }
        }

        throw new Error('Invalid response format from API');
    } catch (error) {
        console.error('Error fetching reservations:', error);
        throw error;
    }
};

const createReservation = async (reservationData) => {
    try {
        console.log('Creating reservation:', reservationData);

        const response = await fetch('/api/reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        });

        console.log('Response status:', response.status);

        const text = await response.text();
        console.log('Response text:', text);

        if (!text) {
            throw new Error('Empty response from server');
        }

        const result = JSON.parse(text);

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create reservation');
        }

        return result;
    } catch (error) {
        console.error('Error creating reservation:', error);
        throw error;
    }
};

const updateReservation = async (id, updates) => {
    try {
        console.log('Updating reservation:', id, updates);

        const response = await fetch(`/api/reservation/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        console.log('Response status:', response.status);

        const text = await response.text();
        console.log('Response text:', text);

        if (!text) {
            throw new Error('Empty response from server');
        }

        const result = JSON.parse(text);

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update reservation');
        }

        return result;
    } catch (error) {
        console.error('Error updating reservation:', error);
        throw error;
    }
};

const deleteReservation = async (id) => {
    try {
        const response = await fetch(`/api/reservation/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete reservation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting reservation:', error);
        throw error;
    }
};

export default function ReservationAdminPanel() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReservation, setNewReservation] = useState({
        userId: '',
        bikeId: '',
        start_time: '',
        end_time: '',
        status: 'reserved',
        start_location: { lat: 0, lng: 0 },
        end_location: { lat: 0, lng: 0 }
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await fetchReservations();
            setReservations(data);
        } catch (err) {
            setError('Failed to load reservations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteReservation(id);
                setReservations(reservations.filter(res => res._id !== id));
                setSuccessMessage('Reservation deleted successfully!');
                setError(null);

                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                setError('Failed to delete reservation');
                setSuccessMessage(null);
                console.error(err);
            }
        }
    };

    const handleEdit = (reservation) => {
        setEditingId(reservation._id);
        setEditForm({ ...reservation });
    };

    const handleSave = async () => {
        try {
            await updateReservation(editingId, editForm);
            setReservations(reservations.map(res =>
                res._id === editingId ? { ...editForm } : res
            ));
            setEditingId(null);
            setEditForm({});
            setSuccessMessage('Reservation updated successfully!');
            setError(null);

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to update reservation');
            setSuccessMessage(null);
            console.error(err);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'start_time' || name === 'end_time') {
            setEditForm(prev => ({
                ...prev,
                [name]: value ? new Date(value).toISOString() : null
            }));
        } else {
            setEditForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNewReservationChange = (e) => {
        const { name, value } = e.target;
        setNewReservation(prev => ({ ...prev, [name]: value }));
    };

    const handleAddReservation = async () => {
        try {
            if (!newReservation.userId || !newReservation.bikeId || !newReservation.start_time) {
                setError('Please fill in all required fields');
                return;
            }

            const result = await createReservation(newReservation);

            setReservations([result.data, ...reservations]);

            setNewReservation({
                userId: '',
                bikeId: '',
                start_time: '',
                end_time: '',
                status: 'reserved',
                start_location: { lat: 0, lng: 0 },
                end_location: { lat: 0, lng: 0 }
            });

            setShowAddForm(false);
            setSuccessMessage('Reservation created successfully!');
            setError(null);

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to create reservation');
            setSuccessMessage(null);
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString();
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'reserved': return 'bg-blue-900 text-blue-200';
            case 'in_progress': return 'bg-yellow-900 text-yellow-200';
            case 'completed': return 'bg-green-900 text-green-200';
            case 'cancelled': return 'bg-red-900 text-red-200';
            default: return 'bg-gray-700 text-gray-200';
        }
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-white">Loading reservations...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Head>
                <title>Bike Reservation Management</title>
                <meta name="description" content="Bike reservation management system" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Main Content */}
            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-8">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Bike Reservation Management</h1>
                        <p className="text-gray-400">Manage all bike reservations from this dashboard</p>
                    </header>

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
                            {successMessage}
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                            <h3 className="text-gray-400">Total Reservations</h3>
                            <p className="text-2xl font-bold text-white">{reservations.length}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                            <h3 className="text-gray-400">Active</h3>
                            <p className="text-2xl font-bold text-green-400">
                                {reservations.filter(r => r.status === 'in_progress').length}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                            <h3 className="text-gray-400">Reserved</h3>
                            <p className="text-2xl font-bold text-blue-400">
                                {reservations.filter(r => r.status === 'reserved').length}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                            <h3 className="text-gray-400">Completed</h3>
                            <p className="text-2xl font-bold text-purple-400">
                                {reservations.filter(r => r.status === 'completed').length}
                            </p>
                        </div>
                    </div>

                    {/* Add Reservation Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            + Add New Reservation
                        </button>
                    </div>

                    {/* Reservations Table */}
                    <div className="bg-gray-800 rounded shadow overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h2 className="text-lg font-medium text-white">Reservations List</h2>
                            <p className="text-sm text-gray-400">All bike reservations</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-750">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bike ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">End Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {reservations.map((reservation) => (
                                    <tr key={reservation._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {reservation.session_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {reservation.userId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {reservation.bikeId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {formatDate(reservation.start_time)} {formatTime(reservation.start_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {reservation.end_time ? (
                                                `${formatDate(reservation.end_time)} ${formatTime(reservation.end_time)}`
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(reservation.status)}`}>
                          {formatStatus(reservation.status)}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(reservation)}
                                                className="text-indigo-400 hover:text-indigo-300 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reservation._id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add Reservation Modal */}
                    {showAddForm && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                                <h3 className="text-lg font-medium text-white mb-4">Add New Reservation</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">User ID *</label>
                                    <input
                                        type="text"
                                        name="userId"
                                        value={newReservation.userId}
                                        onChange={handleNewReservationChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Bike ID *</label>
                                    <input
                                        type="text"
                                        name="bikeId"
                                        value={newReservation.bikeId}
                                        onChange={handleNewReservationChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={newReservation.status}
                                        onChange={handleNewReservationChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    >
                                        <option value="reserved">Reserved</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        value={newReservation.start_time}
                                        onChange={handleNewReservationChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        name="end_time"
                                        value={newReservation.end_time}
                                        onChange={handleNewReservationChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddReservation}
                                        className="px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-600"
                                    >
                                        Create Reservation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editingId && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                                <h3 className="text-lg font-medium text-white mb-4">Edit Reservation</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editForm.status || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    >
                                        <option value="reserved">Reserved</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        value={editForm.start_time ? new Date(editForm.start_time).toLocaleString('sv-SE').slice(0, 16) : ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        name="end_time"
                                        value={editForm.end_time ? new Date(editForm.end_time).toLocaleString('sv-SE').slice(0, 16) : ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 text-white bg-blue-700 rounded-md hover:bg-blue-600"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}