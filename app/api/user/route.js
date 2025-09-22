import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const u = await User.findById(session.user.id).select("-password").lean();
  if (!u) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(u, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { username, email, password } = body;
  const patch = {};
  await connectToDB();
  if (username) {
    const exists = await User.findOne({ username, _id: { $ne: session.user.id } }).lean();
    if (exists) return NextResponse.json({ message: "Username already taken" }, { status: 409 });
    patch.username = username.trim();
  }
  if (email) {
    const exists = await User.findOne({ email, _id: { $ne: session.user.id } }).lean();
    if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    patch.email = String(email).toLowerCase().trim();
  }
  if (password) {
    if (String(password).length < 6) return NextResponse.json({ message: "Password too short" }, { status: 400 });
    patch.password = await bcrypt.hash(password, 10);
  }
  const updated = await User.findByIdAndUpdate(session.user.id, patch, { new: true }).select("-password");
  return NextResponse.json(updated);
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDB();
  await User.findByIdAndDelete(session.user.id);
  return NextResponse.json({ ok: true });
}
