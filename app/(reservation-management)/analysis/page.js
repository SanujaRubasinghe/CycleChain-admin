"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [dateRange]); // Add dateRange as dependency

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fixed API endpoint URL
            const response = await fetch(`/api/analysis?dateRange=${dateRange}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                setAnalyticsData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch analytics data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fallback data in case API fails
    const getFallbackData = () => {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return {
            statusCounts: {
                reserved: 12,
                in_progress: 8,
                completed: 45,
                cancelled: 5
            },
            statusDistribution: {
                reserved: 12,
                in_progress: 8,
                completed: 45,
                cancelled: 5
            },
            revenue: 12540,
            averageBookingValue: 85,
            occupancyRate: 72,
            totalReservations: 70,
            reservationSources: [
                { name: 'Website', value: 45 },
                { name: 'Mobile App', value: 30 },
                { name: 'Phone', value: 15 },
                { name: 'Email', value: 10 },
            ],
            dailyBookings: days.map(day => ({
                day,
                bookings: Math.floor(Math.random() * 20) + 5
            })),
            monthlyTrend: months.slice(0, 6).map(month => ({
                month,
                revenue: Math.floor(Math.random() * 10000) + 5000,
                bookings: Math.floor(Math.random() * 30) + 10
            }))
        };
    };

    const refreshData = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const response = await fetch(`/api/analysis?dateRange=${dateRange}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                setAnalyticsData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch analytics data');
            }
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError(err.message);
        } finally {
            setRefreshing(false);
        }
    };

    const data = analyticsData || getFallbackData();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error && !analyticsData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <p className="text-gray-400 mb-4">Using fallback data for demonstration</p>
                    <button
                        onClick={refreshData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Head>
                <title>Reservation Analytics | Admin Panel</title>
                <meta name="description" content="Reservation management analytics dashboard" />
            </Head>

            {/* Sidebar and Main Content */}
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-gray-800 text-white min-h-screen">
                    <div className="p-4 border-b border-gray-700">
                        <h1 className="text-xl font-bold">Bike Reservations</h1>
                        <p className="text-sm text-gray-400">Admin Panel</p>
                    </div>
                    <nav className="p-4">
                        <ul>
                            <li className="mb-2">
                                <a href="/Home" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">📊</span>
                                    Reservations
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/analysis" className="flex items-center p-2 rounded bg-gray-700">
                                    <span className="mr-2">📈</span>
                                    Analytics
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/reports" className="flex items-center p-2 rounded hover:bg-gray-700">
                                    <span className="mr-2">📄</span>
                                    Reports
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Reservation Analytics</h1>
                        <p className="text-gray-400">Track and analyze your reservation performance</p>

                        {error && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md">
                                <p className="text-yellow-400">Warning: {error}. Showing fallback data.</p>
                            </div>
                        )}
                    </header>

                    {/* Date Range Selector and Refresh Button */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <select
                                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="ytd">Year to Date</option>
                                <option value="12m">Last 12 months</option>
                            </select>
                            <button
                                onClick={refreshData}
                                disabled={refreshing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {/* In Progress */}
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-900/30 text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-400">In Progress</p>
                                    <p className="text-2xl font-bold text-white">{data.statusCounts.in_progress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-900/30 text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-white">{data.statusCounts.completed}</p>
                                </div>
                            </div>
                        </div>

                        {/* Cancelled */}
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-red-900/30 text-red-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-400">Cancelled</p>
                                    <p className="text-2xl font-bold text-white">{data.statusCounts.cancelled}</p>
                                </div>
                            </div>
                        </div>

                        {/* Active (sum of in_progress and reserved) */}
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-900/30 text-purple-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-400">Active</p>
                                    <p className="text-2xl font-bold text-white">
                                        {data.statusCounts.in_progress + data.statusCounts.reserved}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reserved */}
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-yellow-900/30 text-yellow-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-400">Reserved</p>
                                    <p className="text-2xl font-bold text-white">{data.statusCounts.reserved}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4">Reservation Status Distribution</h2>
                        <div className="h-64 flex items-end space-x-4 justify-around">
                            {Object.entries(data.statusDistribution).map(([status, count], index) => {
                                const maxValue = Math.max(...Object.values(data.statusDistribution));
                                const heightPercentage = (count / maxValue) * 100;

                                return (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                        <div
                                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                            style={{ height: `${heightPercentage}%` }}
                                            title={`${count} ${status}`}
                                        ></div>
                                        <span className="text-xs text-gray-400 mt-2 capitalize">{status.replace('_', ' ')}</span>
                                        <span className="text-xs text-gray-500 mt-1">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Revenue Trend</h2>
                            <div className="h-64 flex items-end space-x-4 justify-around">
                                {data.monthlyTrend.map((month, index) => {
                                    const maxRevenue = Math.max(...data.monthlyTrend.map(m => m.revenue));
                                    const heightPercentage = (month.revenue / maxRevenue) * 100;

                                    return (
                                        <div key={index} className="flex flex-col items-center flex-1">
                                            <div
                                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                                style={{ height: `${heightPercentage}%` }}
                                                title={`$${month.revenue}`}
                                            ></div>
                                            <span className="text-xs text-gray-400 mt-2">{month.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Daily Bookings</h2>
                            <div className="h-64 flex items-end space-x-4 justify-around">
                                {data.dailyBookings.map((day, index) => {
                                    const maxBookings = Math.max(...data.dailyBookings.map(d => d.bookings));
                                    const heightPercentage = (day.bookings / maxBookings) * 100;

                                    return (
                                        <div key={index} className="flex flex-col items-center flex-1">
                                            <div
                                                className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                                                style={{ height: `${heightPercentage}%` }}
                                                title={`${day.bookings} bookings`}
                                            ></div>
                                            <span className="text-xs text-gray-400 mt-2">{day.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Revenue</h2>
                            <div className="flex items-end justify-center">
                                <p className="text-3xl font-bold text-white">${data.revenue.toLocaleString()}</p>
                                <span className="ml-2 text-sm text-green-400">+12.4%</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center mt-2">from previous period</p>
                        </div>

                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Average Booking Value</h2>
                            <div className="flex items-end justify-center">
                                <p className="text-3xl font-bold text-white">${data.averageBookingValue}</p>
                                <span className="ml-2 text-sm text-green-400">+3.2%</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center mt-2">from previous period</p>
                        </div>

                        <div className="bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Occupancy Rate</h2>
                            <div className="flex items-end justify-center">
                                <p className="text-3xl font-bold text-white">{data.occupancyRate}%</p>
                                <span className="ml-2 text-sm text-green-400">+5.7%</span>
                            </div>
                            <p className="text-sm text-gray-400 text-center mt-2">from previous period</p>
                        </div>
                    </div>

                    {/* Reservation Sources */}
                    <div className="bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Reservation Sources</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center">
                            <div className="relative w-48 h-48 mb-4 md:mb-0 md:mr-8">
                                {/* Simple pie chart simulation */}
                                <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                                <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'inset(0 0 0 50%)' }}></div>
                                <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)' }}></div>
                                <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-white">Total</p>
                                        <p className="text-gray-400">{data.totalReservations}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {data.reservationSources.map((source, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${
                                            index === 0 ? 'bg-blue-500' :
                                                index === 1 ? 'bg-green-500' :
                                                    index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}></div>
                                        <span className="text-sm text-gray-400">{source.name}</span>
                                        <span className="ml-auto text-sm font-medium text-white">{source.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}