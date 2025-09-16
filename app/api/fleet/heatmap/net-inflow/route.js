import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ride from "@/models/Ride";
import { cellId, cellCenter } from "@/lib/grid";
import { parseTimeRange, decayedWeight } from "@/lib/heatmapUtils";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { start, end, tauHours } = parseTimeRange(searchParams);

  const rides = await Ride.find(
    { endTime: { $gte: start, $lte: end } },
    { start: 1, end: 1, startTime: 1, endTime: 1, _id: 0 }
  ).lean();

  const cells = new Map();
  for (const r of rides) {
    const wDrop = decayedWeight(new Date(r.endTime), end, tauHours, 1);
    const wPick = decayedWeight(new Date(r.startTime), end, tauHours, 1);

    const dropCell = cellId(r.end.lat, r.end.lng);
    cells.set(dropCell, (cells.get(dropCell) || 0) + wDrop);

    const pickCell = cellId(r.start.lat, r.start.lng);
    cells.set(pickCell, (cells.get(pickCell) || 0) - wPick);
  }

  const points = [...cells.entries()]
    .map(([id, weight]) => ({ ...cellCenter(id), weight: Number(weight.toFixed(3)) }))
    .filter((p) => Math.abs(p.weight) > 0.01); // prune noise

  // For heatmaps, show *positive* inflow. If you want deficits too, send separate layer.
  const positives = points.filter((p) => p.weight > 0);

  return NextResponse.json({ points: positives, meta: { start, end, tauHours, meaning: "dropoffs - pickups (>0 shown)" } });
}
