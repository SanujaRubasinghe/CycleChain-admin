import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bike from "@/models/Bike";

export async function GET() {
  await dbConnect();

  const agg = await Bike.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const map = {
    available: 0,
    in_use: 0,
    maintenance: 0,
    reserved: 0,
    offline: 0
  };

  agg.forEach(a => {
    map[a._id] = a.count;
  });

  return NextResponse.json({
    labels: ["Available", "In Use", "Maintenance", "Offline"],
    data: [map.available, map.in_use || map["in_use"], map.maintenance, map.offline]
  });
}
