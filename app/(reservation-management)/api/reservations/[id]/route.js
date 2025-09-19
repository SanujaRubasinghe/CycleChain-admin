// app/api/reservations/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Reservation from "@/app/models/Reservation";

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;
        console.log("Fetching reservation:", id);

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return NextResponse.json(
            { error: 'Failed to fetch reservation', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;
        const updates = await request.json();

        console.log("Updating reservation:", id, updates);

        // Remove _id from updates if present to avoid modifying the document ID
        delete updates._id;

        const result = await Reservation.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Reservation updated successfully',
            data: result
        });
    } catch (error) {
        console.error("Error updating reservation:", error);

        // Make sure to return a proper JSON response even for errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: "Validation failed",
                errors: errors
            }, { status: 400 });
        }

        if (error.name === 'CastError') {
            return NextResponse.json({
                success: false,
                message: "Invalid reservation ID format"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to update reservation',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        console.log("Deleting reservation:", id);

        const result = await Reservation.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting reservation:", error);
        return NextResponse.json(
            { error: 'Failed to delete reservation', details: error.message },
            { status: 500 }
        );
    }
}