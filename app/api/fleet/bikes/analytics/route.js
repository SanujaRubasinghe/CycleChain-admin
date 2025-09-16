import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Bike from "@/models/Bike";

export async function GET() {
    try {
        await dbConnect()

        const totalBikes = await Bike.countDocuments()
        const available = await Bike.countDocuments({status: "available"})
        const inUse = await Bike.countDocuments({status: "in_use"})
        const maintenance = await Bike.countDocuments({status: "maintenance"})

        return NextResponse.json({
            totalBikes,
            available,
            inUse,
            maintenance
        }, 
        {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}