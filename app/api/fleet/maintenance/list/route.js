import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";

export async function GET() {
  await dbConnect();
  const recs = await MaintenanceRecord.find().sort({ reported_at: -1 }).limit(50).lean();
  return NextResponse.json({ records: recs });
}
