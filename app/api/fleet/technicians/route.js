import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Technician from "@/models/Technician";

export async function GET() {
    try {
        await dbConnect()

        const technicians = await Technician.find().sort({name: 1})
        return NextResponse.json(technicians)
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function POST(request) {
    try {
        await dbConnect()

        const body = await request.json()
        const technician = new Technician(body)
        await technician.save()

        return NextResponse.json(technician, {status: 201})
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}