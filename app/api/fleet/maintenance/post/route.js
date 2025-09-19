import dbConnect from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import Bike from "@/models/Bike";
import Technician from "@/models/Technician";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    console.log(body)
    const record = new MaintenanceRecord(body)
    await record.save()

    if (body.status === 'in_progress') {
      await Bike.findByIdAndUpdate(body.bike_id, {status: 'maintenance'})
    }

    if (body.assigned_to) {
      await Technician.findByIdAndUpdate(body.assigned_to, {$inc: {active_tasks: 1}})
    }

    return NextResponse.json(record, {status: 201})
   
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: err.message}, {status: 500})
  }
}
