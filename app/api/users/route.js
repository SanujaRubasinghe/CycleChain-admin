// app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

/**
 * GET /api/users
 * Returns all users (admin only)
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return forbid();

  try {
    await dbConnect();

    const users = await User.find({}, {
      email: 1,
      username: 1,
      role: 1,
      createdAt: 1,
      _id: 1,
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Users found:", users.length);
    console.log("Sample user:", users[0]);

    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
