import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { cellId, cellCenter } from "@/lib/grid";
import { parseTimeRange, decayedWeight } from "@/lib/heatmapUtils";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { start, end, tauHours } = parseTimeRange(searchParams);

  const rides = await Reservation.find(
    { start_time: { $gte: start, $lte: end } },
    { start_location: 1, start_time: 1, _id: 0 }
  ).lean();


  const cells = new Map();
  for (const r of rides) {
    const id = cellId(r.start_location.lat, r.start_location.lng);
    const w = decayedWeight(new Date(r.start_time), end, tauHours, 1);
    cells.set(id, (cells.get(id) || 0) + w);
  }

  const points = [...cells.entries()].map(([id, weight]) => ({
    ...cellCenter(id),
    weight: Number(weight.toFixed(3)),
  }));

  return NextResponse.json({ points, meta: { start, end, tauHours, grid: "≈250-300m" } });
}
