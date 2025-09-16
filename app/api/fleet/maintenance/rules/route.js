import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRule from "@/models/MaintenanceRule";

export async function GET() {
    try {
        await dbConnect()

        const rules = await MaintenanceRule.find({})
            .sort({bike_type: 1, priority: -1})
        
        return NextResponse.json(rules)
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function POST(request) {
    try {
        await dbConnect()

        const body = await request.json()
        const rule = await MaintenanceRule(body)
        await rule.save()

        return NextResponse.json(rule, {status: 201})
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}