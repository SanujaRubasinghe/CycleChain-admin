// app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

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

  await dbConnect();

  // --- USERS ---
  const totalUsers = await User.countDocuments();
  const rolesAgg = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { role: "$_id", count: 1, _id: 0 } },
  ]);

  // --- RIDES ---
  const Ride = await loadModel("@/models/Reservation");
  let monthlyRides = [];
  if (Ride) {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    monthlyRides =
      (await Ride.aggregate([
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
  const totalProducts = await Product.countDocuments();

  // --- PRODUCT PAYMENTS ---
  const ProductPayment = await loadModel("@/models/ProductPayment");
  let productPaymentsAgg = {
    totalRevenue: 0,
    monthly: [],
    byMethod: [],
    byStatus: [],
  };

  if (ProductPayment) {
    const revenueAgg =
      (await ProductPayment.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])) || [];
    productPaymentsAgg.totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

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

    // By payment method
    productPaymentsAgg.byMethod =
      (await ProductPayment.aggregate([
        { $group: { _id: "$method", total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]))?.map((x) => ({ method: x._id, total: x.total, count: x.count })) || [];

    // By status
    productPaymentsAgg.byStatus =
      (await ProductPayment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]))?.map((x) => ({ status: x._id, count: x.count })) || [];
  }

  const ReservationPayment = await loadModel("@/models/Payment");
  let reservationPaymentsAgg = {
    totalRevenue: 0,
    monthly: [],
    byMethod: [],
    byStatus: [],
  };

  if (ReservationPayment) {
    const revenueAgg =
      (await ReservationPayment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])) || [];
    reservationPaymentsAgg.totalRevenue = revenueAgg[0]?.total || 0;

    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    let monthlyRevenue =
      (await ReservationPayment.aggregate([
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

    reservationPaymentsAgg.byMethod =
      (await ReservationPayment.aggregate([
        { $group: { _id: "$method", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]))?.map((x) => ({ method: x._id, total: x.total, count: x.count })) || [];

    reservationPaymentsAgg.byStatus =
      (await ReservationPayment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]))?.map((x) => ({ status: x._id, count: x.count })) || [];
  }

  return NextResponse.json({
    users: { total: totalUsers },
    roles: rolesAgg,
    rides: { monthly: monthlyRides },
    products: { total: totalProducts },
    productPayments: productPaymentsAgg,
    reservationPayments: reservationPaymentsAgg,
  });
}
