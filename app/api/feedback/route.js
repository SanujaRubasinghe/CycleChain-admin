import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Failed to get feedbacks", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const feedback = await Feedback.create(data);
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create feedback", error: error.message }, { status: 500 });
  }
}
