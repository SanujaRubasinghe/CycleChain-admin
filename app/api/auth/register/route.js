import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "username, email and password are required" },
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

    // unique checks
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // (optional) unique username check
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return NextResponse.json({ message: "Username already taken" }, { status: 409 });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      username,
      password: hash,
      role: "user", // default role
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/register error", err);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
