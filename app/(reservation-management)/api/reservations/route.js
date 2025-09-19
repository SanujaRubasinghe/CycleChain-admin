// app/api/reservations/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Reservation from "@/app/models/Reservation";

export async function GET(request) {
    try {
        await dbConnect();

        // Get query parameters from URL
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        console.log("User ID from query:", userId);

        let reservations;
        if (userId) {
            // Get reservations for a specific user
            reservations = await Reservation.find({ userId: userId });
        } else {
            // Get all reservations
            reservations = await Reservation.find({});
        }

        return NextResponse.json({
            success: true,
            data: reservations,
            count: reservations.length
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

// Your existing POST method stays the same
export async function POST(request) {
    try {
        await dbConnect();

        const data = await request.json();
        console.log("Received data:", data);

        // Map frontend field names to schema field names
        const reservationData = {
            userId: data.user_id || data.userId,
            bikeId: data.bike_id || data.bikeId,
            start_time: data.start_time || data.startTime,
            end_time: data.end_time || data.endTime,
            start_location: data.start_location || data.startLocation,
            end_location: data.end_location || data.endLocation,
            distance: data.distance,
            cost: data.cost,
            geofence_violation: data.geofence_violation || data.geofenceViolation,
            status: data.status || "reserved"
        };

        // Validate required fields
        if (!reservationData.userId) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 400 }
            );
        }

        if (!reservationData.bikeId) {
            return NextResponse.json(
                { success: false, message: "Bike ID is required" },
                { status: 400 }
            );
        }

        const reservation = await Reservation.create(reservationData);

        return NextResponse.json({
            success: true,
            data: reservation,
            message: "Reservation created successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating reservation:", error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: "Validation failed",
                errors: errors
            }, { status: 400 });
        }

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "Duplicate session ID detected"
            }, { status: 409 });
        }

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}