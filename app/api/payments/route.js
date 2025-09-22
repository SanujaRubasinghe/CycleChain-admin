import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await dbConnect();

    // Filter only successful payments
    const filter = { status: "paid" };

    // 🟢 Total revenue (all-time)
    const totalRevenue = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 🟢 Weekly revenue (last 7 days)
    const lastWeek = await Payment.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 🟢 Monthly revenue (last 30 days)
    const lastMonth = await Payment.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return NextResponse.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      weeklyRevenue: lastWeek[0]?.total || 0,
      monthlyRevenue: lastMonth[0]?.total || 0,
    });
  } catch (err) {
    console.error("Error fetching payment analytics:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
