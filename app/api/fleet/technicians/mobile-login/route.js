import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Technician from "@/models/Technician";

export async function GET(request, {params}) {
    return NextResponse.json({message: "End point to request OTP"})
}

export async function POST(request, {params}) {
    return NextResponse.json({message: "End point to verify OTP"})
}