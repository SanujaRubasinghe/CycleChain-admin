import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bike from "@/models/Bike";
import { cellId, cellCenter } from "@/lib/grid";
import { parseTimeRange } from "@/lib/heatmapUtils";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { start, end } = parseTimeRange(searchParams);
  const threshold = Number(searchParams.get("threshold") || 25); 
  const minSeen = new Date(end.getTime() - 6 * 3600 * 1000); 

  const bikes = await Bike.find(
    {
      lastSeenAt: { $gte: start, $lte: end },
      soc: { $lte: threshold + 30 }, 
      status: { $ne: "maintenance" },
    },
    { location: 1, soc: 1, _id: 0 }
  ).lean();

  const cells = new Map();
  for (const b of bikes) {
    if (!b.location) continue;
    const deficit = Math.max(0, threshold - (b.soc ?? 0));
    if (deficit <= 0) continue;
    const id = cellId(b.location.lat, b.location.lng);
    cells.set(id, (cells.get(id) || 0) + deficit);
  }

  const points = [...cells.entries()].map(([id, weight]) => ({
    ...cellCenter(id),
    weight: Number(weight.toFixed(3)),
  }));

  return NextResponse.json({ points, meta: { start, end, threshold, note: "weight = threshold - SOC (sum per cell)" } });
}
