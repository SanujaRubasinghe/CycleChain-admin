// app/api/admin/users/[id]/route.js
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
 * DELETE /api/admin/users/:id
 */
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return forbid();

  await connectToDB();

  const ok = await User.findByIdAndDelete(params.id);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ deleted: true });
}
