import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET() {
  await dbConnect();

  const sessions = await Reservation.find({ status: "in_progress" })
    .limit(100)
    .sort({ start_time: -1 })
    .lean();

  const enriched = sessions.map(s => {
    const minutes = s.start_time ? Math.round((Date.now() - new Date(s.start_time).getTime()) / 60000) : null;
    return { ...s, activeMinutes: minutes };
  });

  return NextResponse.json({ count: enriched.length, sessions: enriched });
}
