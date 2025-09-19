// app/api/admin/report/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

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
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  await connectToDB();

  const totalUsers = await User.countDocuments();
  const rolesAgg = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { role: "$_id", count: 1, _id: 0 } },
  ]);

  const totalProducts = await Product.countDocuments();

  const Order = await loadModel("@/models/Order");
  let totalRevenue = 0;
  if (Order) {
    const revenueAgg =
      (await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])) || [];
    totalRevenue = revenueAgg[0]?.total || 0;
  }

  const lines = [];
  lines.push("Metric,Value");
  lines.push(`Total Users,${totalUsers}`);
  for (const r of rolesAgg) lines.push(`Users (${r.role}),${r.count}`);
  lines.push(`Total Products,${totalProducts}`);
  lines.push(`Total Revenue,${totalRevenue}`);

  const csv = lines.join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admin_report.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
