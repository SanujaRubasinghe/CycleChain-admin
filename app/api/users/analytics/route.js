import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";

import User from "@/models/User";
import Reservation from "@/models/Reservation";
import Product from "@/models/Product";
import ProductPayment from "@/models/ProductPayment";
import Payment from "@/models/Payment";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

function getStartDate(range) {
  const now = new Date();
  const date = new Date();
  switch (range) {
    case "30d":
      date.setDate(now.getDate() - 30);
      break;
    case "90d":
      date.setDate(now.getDate() - 90);
      break;
    case "6m":
      date.setMonth(now.getMonth() - 6);
      break;
    case "12m":
      date.setMonth(now.getMonth() - 12);
      break;
    default:
      date.setDate(now.getDate() - 30);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(req) {
  // const session = await getServerSession(authOptions);
  // if (!session?.user || session.user.role !== "admin") return forbid();

  await dbConnect();

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "30d";
  const since = getStartDate(range);

  // --- USERS ---
  const totalUsers = await User.countDocuments();
  const rolesAgg = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { role: "$_id", count: 1, _id: 0 } },
  ]);

  // --- RIDES ---
  let monthlyRides = [];
  if (Reservation) {
    monthlyRides =
      (await Reservation.aggregate([
        { $match: { start_time: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$start_time" }, m: { $month: "$start_time" } },
            rides: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ])) || [];

    monthlyRides = monthlyRides.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, "0")}`,
      rides: x.rides,
    }));
  }

  // --- PRODUCTS ---
  const totalProducts = Product ? await Product.countDocuments() : 0;

  // --- PRODUCT PAYMENTS ---
  let productPaymentsAgg = { monthly: [], byStatus: [] };

  if (ProductPayment) {
    let monthlyRevenue =
      (await ProductPayment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            total: { $sum: "$total" },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ])) || [];

    productPaymentsAgg.monthly = monthlyRevenue.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, "0")}`,
      total: x.total,
    }));

    productPaymentsAgg.byStatus =
      (await ProductPayment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]))?.map((x) => ({ status: x._id, count: x.count })) || [];
  }

  // --- RESERVATION PAYMENTS ---
  let reservationPaymentsAgg = { monthly: [], byStatus: [] };

  if (Payment) {
    let monthlyRevenue =
      (await Payment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ])) || [];

    reservationPaymentsAgg.monthly = monthlyRevenue.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, "0")}`,
      total: x.total,
    }));

    reservationPaymentsAgg.byStatus =
      (await Payment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]))?.map((x) => ({ status: x._id, count: x.count })) || [];
  }

  return NextResponse.json({
    roles: rolesAgg,
    rides: { monthly: monthlyRides },
    products: { total: totalProducts },
    productPayments: productPaymentsAgg,
    reservationPayments: reservationPaymentsAgg,
  });
}
