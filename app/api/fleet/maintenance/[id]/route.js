import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import Bike from "@/models/Bike";
import Technician from "@/models/Technician";

export async function GET(request, {params}) {
    try {   
        await dbConnect()

        const {id} = await params

        const record = await MaintenanceRecord.findById(id)
            .populate('assigned_to', 'name email phone specialization')

        if (!record) {
            return NextResponse.json({error: 'Record not found'}, {status: 404})
        }

        return NextResponse.json(record)
    } catch(err) {
        return NextResponse.json({error: err.message}, {status: 500})
    }
}

export async function PUT(request, {params}) {
    try {
        await dbConnect()

        const {id} = await params

        const body = await request.json()
        const record = await MaintenanceRecord.findById(id)

        if (!record) {
            return NextResponse.json({error: 'Record not found'}, {status: 404})
        }

        if (body.status && body.status !== record.status) {
            if (body.status === 'completed') {
                await Bike.updateOne(
                    {bikeId: record.bikeId}, 
                    {$set: {
                        status: 'available',
                        lastMaintenance: new Date()
                    }})

                if (record.assigned_to) {
                    await Technician.findByIdAndUpdate(record.assigned_to, {
                        $inc: {assigned_tasks: -1}
                    })
                }
            }

            if (body.status === "in_progress") {
                await Bike.updateOne(
                    {bikeId: record.bikeId}, 
                    {$set: {
                        status: 'maintenance'
                    }}
                )
            }
        }

        if (body.assigned_to && body.assigned_to !== record.assigned_to?.toString()) {
            if (record.assigned_to) {
                await Technician.findByIdAndUpdate(record.assigned_to, {
                    $inc: {assigned_tasks: -1}
                })
            }

            if (body.assigned_to) {
                await Technician.findByIdAndUpdate(body.assigned_to, {
                    $inc: {assigned_tasks: 1}
                })
            }
        }

        const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
            params.id,
            body,
            {new: true}
        ).populate('assigned_to', 'name email phone specialization')

        return NextResponse.json(updatedRecord)
    } catch (err) {
        return NextResponse.json({error: err.message}, {status: 500})
    }
}

export async function DELETE(request, {params}) {
    try {
        await dbConnect()

        const {id} = await params

        const record = await MaintenanceRecord.findById(id)

        if (!record) {
            return NextResponse.json({error: 'Record not found'}, {status: 404})
        }

        if (record.assigned_to && record.status !== 'completed') {
            await Technician.findByIdAndUpdate(record.assigned_to, {
                $inc: {active_tasks: -1}
            })
        }

        await MaintenanceRecord.findByIdAndDelete(id)

        return NextResponse.json({message: 'Record deleted successfully'})
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}