// admin/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email: email.toLowerCase(),
      password: hash,
      role: "admin", // <- force admin role
    });

    return NextResponse.json(
      {
        id: admin._id.toString(),
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { message: "Admin registration failed" },
      { status: 500 }
    );
  }
}
