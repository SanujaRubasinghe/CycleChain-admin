import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RentalSession from "@/models/RentalSession";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET(request) {
  await dbConnect();

  const url = new URL(request.url);
  const months = parseInt(url.searchParams.get("months") || "7", 10);

  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);

  const agg = await RentalSession.aggregate([
    { $match: { start_time: { $gte: start } } },
    {
      $project: {
        year: { $year: "$start_time" },
        month: { $month: "$start_time" },
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  const labels = [];
  const dataMap = {};
  let cursor = new Date(start);
  for (let i = 0; i < months; i++) {
    const lab = cursor.toLocaleString("default", { month: "short" }); 
    labels.push(lab);
    dataMap[`${cursor.getFullYear()}-${cursor.getMonth() + 1}`] = 0;
    cursor.setMonth(cursor.getMonth() + 1);
  }

  agg.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    dataMap[key] = item.count;
  });

  const data = labels.map((lab, idx) => {
    const dt = new Date(start);
    dt.setMonth(dt.getMonth() + idx);
    const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
    return dataMap[key] || 0;
  });

  return NextResponse.json({ labels, data });
}
