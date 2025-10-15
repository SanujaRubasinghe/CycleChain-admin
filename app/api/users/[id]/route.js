import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

/**
 * DELETE /api/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Session:", session); // Debug log
    
    if (!session?.user) {
      console.log("No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      console.log("User is not admin:", session.user.role);
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    console.log("Deleting user ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return NextResponse.json(
        { message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.email === session.user.email) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    console.log("User deleted successfully:", id);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json(
      { message: `Failed to delete user: ${err.message}` },
      { status: 500 }
    );
  }
}