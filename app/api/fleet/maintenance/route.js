import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import Technician from "@/models/Technician";

export async function GET(request) {
    try {
        await dbConnect()

        const {searchParams} = new URL(request.url)
        const status = searchParams.get('status')
        const technician = searchParams.get('technician')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search')

        let query = {}

        if (status && status !== 'all') {
            query.status = status
        }

        if (technician && technician !== 'all') {
            query.assigned_to = technician
        }

        if (search) {
            query.$or = [
                {bikeId: {$regex: search, $options: 'i'}},
                {issue: {$regex: search, $options: 'i'}}
            ]
        }

        const records = await MaintenanceRecord.find(query)
            .populate({
                path: 'assigned_to',
                select: 'name email phone specialization',
                model: 'Technician'
            })
            .sort({scheduled_at: 1})
            .skip((page - 1) * limit)
            .limit(limit)

        const total = await MaintenanceRecord.countDocuments(query)

        return NextResponse.json({
            records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        console.log(err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}