import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await dbConnect();

    // Get payment method distribution
    const methodDistribution = await Payment.aggregate([
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get payment status distribution
    const statusDistribution = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent payment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTrends = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          crypto: {
            $sum: {
              $cond: [{ $eq: ["$method", "crypto"] }, 1, 0]
            }
          },
          card: {
            $sum: {
              $cond: [{ $eq: ["$method", "card"] }, 1, 0]
            }
          },
          qr: {
            $sum: {
              $cond: [{ $eq: ["$method", "qr"] }, 1, 0]
            }
          },
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get currency distribution
    const currencyDistribution = await Payment.aggregate([
      {
        $group: {
          _id: "$currency",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      methodDistribution,
      statusDistribution,
      recentTrends,
      currencyDistribution
    });

  } catch (error) {
    console.error("Error fetching payment distribution:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment distribution data" },
      { status: 500 }
    );
  }
}
