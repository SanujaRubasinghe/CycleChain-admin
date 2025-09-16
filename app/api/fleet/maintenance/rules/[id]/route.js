import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRule from "@/models/MaintenanceRule";

export async function PUT(request, {params}) {
    try {
        await dbConnect()

        const {id} = await params
        const body = await request.json()

        const rule = await MaintenanceRule.findById(id)

        if (!rule) {
            return NextResponse.json({error: 'Rule not found'}, {status: 404})
        }

        const updatedRule = await MaintenanceRule.findByIdAndUpdate(id, 
            {$set: {
                is_active: body.is_active
            }},
            {new: true}
        )

        return NextResponse.json(updatedRule)
        
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function DELETE(request, {params}) {
    try {
        await dbConnect()

        const {id} = await params
        const rule = await MaintenanceRule.findById(id)

        if (!rule) {
            return NextResponse.json({error: 'Rule not found'}, {status: 404})
        }

        await MaintenanceRule.findByIdAndDelete(id)

        return NextResponse.json({message: 'Rule deleted successfully'})
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}