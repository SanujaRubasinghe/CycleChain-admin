// app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

// Helper to try loading optional models safely
async function loadModel(path) {
  try {
    const mod = await import(path);
    return mod.default || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return forbid();

  await connectToDB();

  // --- USERS ---
  const totalUsers = await User.countDocuments();
  const rolesAgg = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { role: "$_id", count: 1, _id: 0 } },
  ]);

  // --- RIDES (optional) ---
  const Ride = await loadModel("@/models/Ride"); // define if you have it
  let monthlyRides = [];
  if (Ride) {
    // last 6 months
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    monthlyRides =
      (await Ride.aggregate([
        { $match: { startTime: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$startTime" }, m: { $month: "$startTime" } },
            rides: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ])) || [];

    // map to labels like "2025-09"
    monthlyRides = monthlyRides.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, "0")}`,
      rides: x.rides,
    }));
  }

  // --- ORDERS / SALES (optional) ---
  const Order = await loadModel("@/models/Order"); // define if you have it
  let totalRevenue = 0;
  let monthlySales = [];
  if (Order) {
    const revenueAgg =
      (await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])) || [];
    totalRevenue = revenueAgg[0]?.total || 0;

    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    monthlySales =
      (await Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            total: { $sum: "$total" },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ])) || [];

    monthlySales = monthlySales.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, "0")}`,
      total: x.total,
    }));
  }

  // --- PRODUCTS ---
  const totalProducts = await Product.countDocuments();

  return NextResponse.json({
    users: { total: totalUsers },
    roles: rolesAgg, // [{ role, count }]
    rides: { monthly: monthlyRides }, // [{ month, rides }]
    sales: { totalRevenue, monthly: monthlySales }, // [{ month, total }]
    products: { total: totalProducts },
  });
}
