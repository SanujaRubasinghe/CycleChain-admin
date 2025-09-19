import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

// Helper function to calculate date ranges
const getDateRange = (range) => {
    const now = new Date();
    let startDate = new Date();

    // Set time to beginning/end of day for proper date comparison
    now.setHours(23, 59, 59, 999);
    startDate.setHours(0, 0, 0, 0);

    switch (range) {
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
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case '12m':
            startDate.setMonth(now.getMonth() - 12);
            break;
        default:
            startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate: now };
};

// Convert Date to ISO string without milliseconds for comparison
const formatDateForQuery = (date) => {
    return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
};

// Helper function to calculate analytics from reservations
function calculateAnalytics(reservations, startDate, endDate) {
    const totalReservations = reservations.length;
    const completedReservations = reservations.filter(r => r.status === 'completed').length;
    const pendingReservations = reservations.filter(r => r.status === 'pending' || r.status === 'reserved').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

    const revenue = reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.cost || 0), 0);

    const averageBookingValue = completedReservations > 0
        ? revenue / completedReservations
        : 0;

    // Generate monthly trend data
    const monthlyTrend = generateMonthlyTrend(reservations, startDate, endDate);

    // For demo purposes - in a real app, you'd have actual service data
    const popularServices = [
        { name: 'Mountain Bike', count: Math.floor(totalReservations * 0.4) },
        { name: 'Road Bike', count: Math.floor(totalReservations * 0.3) },
        { name: 'Hybrid Bike', count: Math.floor(totalReservations * 0.2) },
        { name: 'Electric Bike', count: Math.floor(totalReservations * 0.1) },
    ];

    return {
        totalReservations,
        completedReservations,
        pendingReservations,
        cancelledReservations,
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
        dailyBookings: generateDailyBookings(reservations, startDate, endDate),
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

    while (current <= endDate) {
        const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

        const monthReservations = reservations.filter(r => {
            const reservationDate = new Date(r.start_time);
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
        const day = new Date(reservation.start_time).getDay();
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
        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const dateRange = searchParams.get('dateRange') || '30d';
        const reportType = searchParams.get('reportType') || 'summary';

        const { startDate, endDate } = getDateRange(dateRange);

        console.log('Querying dates:', {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        });

        // Format dates to match the string format in database
        const startDateStr = formatDateForQuery(startDate);
        const endDateStr = formatDateForQuery(endDate);

        console.log('Formatted query dates:', {
            start: startDateStr,
            end: endDateStr
        });

        // Fetch ALL reservations first to debug
        const allReservations = await Reservation.find({}).lean();
        console.log('Total reservations in DB:', allReservations.length);

        // Log a few sample start_time values to see the format
        if (allReservations.length > 0) {
            console.log('Sample start_time values:', allReservations.slice(0, 3).map(r => r.start_time));
        }

        // Fetch filtered reservations - using string comparison
        const reservations = await Reservation.find({
            start_time: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        }).lean();

        console.log('Filtered reservations:', reservations.length);

        // If no results, try a broader query to debug
        if (reservations.length === 0) {
            console.log('No results with current query, trying broader search...');

            // Try querying without date filter to see if there are any reservations
            const allInRange = await Reservation.find({}).lean();
            console.log('All reservations without filter:', allInRange.length);

            // Try with just start date
            const withStartOnly = await Reservation.find({
                start_time: { $gte: startDateStr }
            }).lean();
            console.log('Reservations with start date only:', withStartOnly.length);
        }

        // Calculate analytics data
        const analyticsData = calculateAnalytics(reservations, startDate, endDate);

        return NextResponse.json({
            success: true,
            data: analyticsData,
            dateRange: {
                start: startDate,
                end: endDate,
                label: getDateRangeLabel(dateRange)
            },
            reportType,
            debug: {
                totalInDB: allReservations.length,
                filteredCount: reservations.length,
                dateRangeUsed: `${startDateStr} to ${endDateStr}`,
                query: {
                    start_time: { $gte: startDateStr, $lte: endDateStr }
                }
            }
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}