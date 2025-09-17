import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const feedback = await Feedback.findById(params.id);
    if (!feedback) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to get feedback", error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const data = await req.json();
    const updated = await Feedback.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update feedback", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const deleted = await Feedback.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete feedback", error: error.message }, { status: 500 });
  }
}
