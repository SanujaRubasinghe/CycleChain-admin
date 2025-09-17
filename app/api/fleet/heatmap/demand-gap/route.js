import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bike from "@/models/Bike";
import RequestEvent from "@/models/RequestEvent";
import { cellId, cellCenter } from "@/lib/grid";
import { parseTimeRange, decayedWeight } from "@/lib/heatmapUtils";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { start, end, tauHours } = parseTimeRange(searchParams);

  const reqs = await RequestEvent.find(
    { createdAt: { $gte: start, $lte: end } },
    { location: 1, createdAt: 1, _id: 0 }
  ).lean();

  const demand = new Map();
  for (const e of reqs) {
    const id = cellId(e.location.lat, e.location.lng);
    const w = decayedWeight(new Date(e.createdAt), end, tauHours, 1);
    demand.set(id, (demand.get(id) || 0) + w);
  }

  const freshSince = new Date(end.getTime() - 3 * 3600 * 1000); 
  const bikes = await Bike.find(
    {
      status: "available",
      // lastSeenAt: { $gte: freshSince },
    },
    { currentLocation: 1, _id: 0 }
  ).lean();

  const supply = new Map();
  for (const b of bikes) {
    if (!b.currentLocation) continue;
    const id = cellId(b.currentLocation.lat, b.currentLocation.lng);
    supply.set(id, (supply.get(id) || 0) + 1);
  }

  const allCells = new Set([...demand.keys(), ...supply.keys()]);
  const points = [];
  for (const id of allCells) {
    const d = demand.get(id) || 0;
    const s = supply.get(id) || 0;
    const gap = d - s;
    if (gap > 0.05) {
      points.push({ ...cellCenter(id), weight: Number(gap.toFixed(3)) });
    }
  }

  return NextResponse.json({ points, meta: { start, end, tauHours, meaning: "requests - available bikes (clipped > 0)" } });
}
