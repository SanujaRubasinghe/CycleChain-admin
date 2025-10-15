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
    { end_time: { $gte: start, $lte: end } },
    { start_location: 1, end_location: 1, start_time: 1, end_time: 1, _id: 0 }
  ).lean();

  const cells = new Map();
  for (const r of rides) {
    const wDrop = decayedWeight(new Date(r.end_time), end, tauHours, 1);
    const wPick = decayedWeight(new Date(r.start_time), end, tauHours, 1);

    const dropCell = cellId(r.end_location.lat, r.end_location.lng);
    cells.set(dropCell, (cells.get(dropCell) || 0) + wDrop);

    const pickCell = cellId(r.start_location.lat, r.start_location.lng);
    cells.set(pickCell, (cells.get(pickCell) || 0) - wPick);
  }

  const points = [...cells.entries()]
    .map(([id, weight]) => ({ ...cellCenter(id), weight: Number(weight.toFixed(3)) }))
    .filter((p) => Math.abs(p.weight) > 0.01); 

  const positives = points.filter((p) => p.weight > 0);

  return NextResponse.json({ points: positives, meta: { start, end, tauHours, meaning: "dropoffs - pickups (>0 shown)" } });
}
