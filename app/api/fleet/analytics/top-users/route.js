import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RentalSession from "@/models/RentalSession";
import User from "@/models/User";

export async function GET(request) {
  await dbConnect();

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const agg = await RentalSession.aggregate([
    { $match: { start_time: { $gte: since } } },
    { $group: { _id: "$user_id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const userIds = agg.map(a => a._id);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const usersMap = users.reduce((acc, u) => { acc[u._id] = u; return acc; }, {});

  const result = agg.map(a => ({ user_id: a._id, count: a.count, user: usersMap[a._id] || null }));

  return NextResponse.json({ topUsers: result });
}
