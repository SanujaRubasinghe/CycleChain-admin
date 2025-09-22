// app/api/payment/analytics/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET() {
  await dbConnect();

  try {
    const now = new Date();

    // Weekly total (last 7 days)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyTotal = await Payment.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Monthly total (last 30 days)
    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);
    const monthlyTotal = await Payment.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Group by day (for charts)
    const daily = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      weeklyTotal: weeklyTotal[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      daily
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
