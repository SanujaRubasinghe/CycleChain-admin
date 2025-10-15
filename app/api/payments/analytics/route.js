// app/api/payment/analytics/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly"; // 'weekly' or 'monthly'

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

    // Determine the date range and grouping format based on period
    let startDate, dateFormat;
    if (period === "weekly") {
      startDate = weekStart;
      dateFormat = "%Y-%m-%d"; // Daily grouping for weekly view
    } else {
      startDate = monthStart;
      dateFormat = "%Y-%m-%d"; // Daily grouping for monthly view
    }

    // Group by day (for charts)
    const daily = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      weeklyTotal: weeklyTotal[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      daily,
      period
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
