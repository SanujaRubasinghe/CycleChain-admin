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
    { startTime: { $gte: start, $lte: end } },
    { start: 1, startTime: 1, _id: 0 }
  ).lean();

  const cells = new Map();
  for (const r of rides) {
    const id = cellId(r.start.lat, r.start.lng);
    const w = decayedWeight(new Date(r.startTime), end, tauHours, 1);
    cells.set(id, (cells.get(id) || 0) + w);
  }

  const points = [...cells.entries()].map(([id, weight]) => ({
    ...cellCenter(id),
    weight: Number(weight.toFixed(3)),
  }));

  return NextResponse.json({ points, meta: { start, end, tauHours, grid: "≈250-300m" } });
}
