// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';


// Helper function to calculate date ranges
const getDateRange = (range = '30d') => {
    const now = new Date();
    const startDate = new Date();

    switch(range) {
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
        case 'ytd':
            startDate.setMonth(0, 1); // January 1st
            startDate.setHours(0, 0, 0, 0);
            break;
        case '12m':
            startDate.setMonth(now.getMonth() - 12);
            break;
        default:
            startDate.setDate(now.getDate() - 30); // Default to 30 days
    }

    // Set time to beginning of day for start date
    startDate.setHours(0, 0, 0, 0);

    // Set time to end of day for end date
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };
};

// Helper function to calculate analytics from reservations
function calculateAnalytics(reservations, startDate, endDate) {
    const totalReservations = reservations.length;

    // Calculate status counts in the format expected by frontend
    const statusCounts = {
        in_progress: reservations.filter(r => r.status === 'in_progress').length,
        completed: reservations.filter(r => r.status === 'completed').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        reserved: reservations.filter(r => r.status === 'reserved').length
    };

    const statusDistribution = { ...statusCounts }; // Copy for distribution

    const revenue = reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.cost || 0), 0);

    const averageBookingValue = statusCounts.completed > 0
        ? revenue / statusCounts.completed
        : 0;

    // Generate monthly trend data
    const monthlyTrend = generateMonthlyTrend(reservations, startDate, endDate);
    const dailyBookings = generateDailyBookings(reservations, startDate, endDate);

    // For demo purposes - in a real app, you'd have actual service data
    const popularServices = [
        { name: 'Mountain Bike', count: Math.floor(totalReservations * 0.4) },
        { name: 'Road Bike', count: Math.floor(totalReservations * 0.3) },
        { name: 'Hybrid Bike', count: Math.floor(totalReservations * 0.2) },
        { name: 'Electric Bike', count: Math.floor(totalReservations * 0.1) },
    ];

    return {
        totalReservations,
        statusCounts,
        statusDistribution,
        revenue: Math.round(revenue),
        averageBookingValue: Math.round(averageBookingValue),
        occupancyRate: calculateOccupancyRate(reservations),
        popularServices,
        reservationSources: [
            { name: 'Website', value: 45 },
            { name: 'Mobile App', value: 30 },
            { name: 'Phone', value: 15 },
            { name: 'Email', value: 10 },
        ],
        dailyBookings,
        monthlyTrend
    };
}

function calculateOccupancyRate(reservations) {
    // Simple occupancy rate calculation
    const completed = reservations.filter(r => r.status === 'completed').length;
    const total = reservations.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function generateMonthlyTrend(reservations, startDate, endDate) {
    const months = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

        const monthReservations = reservations.filter(r => {
            const reservationDate = new Date(r.createdAt);
            return reservationDate >= monthStart && reservationDate <= monthEnd;
        });

        const monthRevenue = monthReservations
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.cost || 0), 0);

        months.push({
            month: current.toLocaleDateString('en-US', { month: 'short' }),
            revenue: Math.round(monthRevenue),
            bookings: monthReservations.length
        });

        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

function generateDailyBookings(reservations, startDate, endDate) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    reservations.forEach(reservation => {
        const day = new Date(reservation.createdAt).getDay();
        dayCounts[days[day]]++;
    });

    return days.map(day => ({
        day,
        bookings: dayCounts[day]
    }));
}

function getDateRangeLabel(range) {
    switch (range) {
        case '7d': return 'Last 7 days';
        case '30d': return 'Last 30 days';
        case '90d': return 'Last 90 days';
        case 'ytd': return 'Year to Date';
        case '12m': return 'Last 12 months';
        default: return 'Custom Range';
    }
}

export async function GET(request) {
    try {
        await dbConnect()

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const dateRange = searchParams.get('dateRange') || '30d';

        const { startDate, endDate } = getDateRange(dateRange);

        console.log('Fetching reservations from:', startDate, 'to:', endDate);

        // Fetch reservations within date range
        const reservations = await Reservation.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).lean();

        console.log('Found reservations:', reservations.length);

        // Calculate analytics data
        const analyticsData = calculateAnalytics(reservations, startDate, endDate);

        return NextResponse.json({
            success: true,
            data: analyticsData,
            dateRange: {
                start: startDate,
                end: endDate,
                label: getDateRangeLabel(dateRange)
            }
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}