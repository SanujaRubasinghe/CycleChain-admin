import { NextResponse } from "next/server";

export async function GET() {
  if (!global.announcedBikes) global.announcedBikes = {};
  return NextResponse.json({
    success: true,
    bikes: Object.values(global.announcedBikes),
  });
}
