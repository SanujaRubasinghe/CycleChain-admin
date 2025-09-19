// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

/**
 * GET /api/admin/users
 * ?q=search (by email/username)
 * returns: [{ _id, email, username, role, createdAt }]
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return forbid();

  await connectToDB();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const filter = {};
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(filter, {
    email: 1,
    username: 1,
    role: 1,
    createdAt: 1,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(users);
}
