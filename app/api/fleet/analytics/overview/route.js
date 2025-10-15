import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function GET(request) {
  await dbConnect();

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const totalRentalsPromise = Reservation.countDocuments({ status: "completed-paid" });

  const activeUsersFromSessionsPromise = Reservation.distinct("user_id", { status: "in_progress" });
  const activeUsersFromLastSeenPromise = User.countDocuments({ lastSeenAt: { $gte: thirtyDaysAgo } });

  const avgRideTimePromise = Reservation.aggregate([
    { $match: { status: "completed-paid", end_time: { $exists: true }, start_time: { $exists: true }, end_time: { $gte: thirtyDaysAgo } } },
    { $project: { diffMinutes: { $divide: [{ $subtract: ["$end_time", "$start_time"] }, 1000 * 60] } } },
    { $group: { _id: null, avgMinutes: { $avg: "$diffMinutes" } } }
  ]);

  const revenuePromise = Payment.aggregate([
    { $match: { status: "completed", createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const [totalRentals, activeSessionsUsers, activeUsersLastSeen, avgRideTimeAgg, revenueAgg] = await Promise.all([
    totalRentalsPromise,
    activeUsersFromSessionsPromise,
    activeUsersFromLastSeenPromise,
    avgRideTimePromise,
    revenuePromise
  ]);

  const activeUsers = new Set([
    ...(activeSessionsUsers || []),
  ]).size + activeUsersLastSeen; 

  const avgRideTime = (avgRideTimeAgg[0]?.avgMinutes || 0).toFixed(1);
  const revenue = (revenueAgg[0]?.total || 0);

  return NextResponse.json({
    totalRentals,
    activeUsers,
    avgRideTime: `${avgRideTime}`, 
    revenue
  });
}
