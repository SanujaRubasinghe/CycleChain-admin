// app/api/products/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  await connectToDB();
  const products = await Product.find({ inStock: true }).sort({ category: 1, title: 1 });
  return NextResponse.json(products);
}

// DEV ONLY: one-time seeding (no auth). Remove in production if you want.
export async function POST() {
  await connectToDB();
  const count = await Product.countDocuments();
  if (count > 0) return NextResponse.json({ seeded: false, reason: "already seeded" });

  await Product.insertMany([
    { title: "Aero Helmet", slug: "aero-helmet", category: "helmets", price: 12000, inStock: true },
    { title: "City Lock", slug: "city-lock", category: "locks", price: 4500, inStock: true },
    { title: "Thermo Bottle", slug: "thermo-bottle", category: "bottles", price: 2500, inStock: true },
    { title: "Gel Seat Cover", slug: "gel-seat-cover", category: "seat-covers", price: 3900, inStock: true },
    { title: "Grip Gloves", slug: "grip-gloves", category: "gloves", price: 3200, inStock: true },
    { title: "E-Bike Cable", slug: "ebike-cable", category: "ebike-cables", price: 5400, inStock: true },
    { title: "E-Bike Charger 48V", slug: "ebike-charger-48v", category: "chargers", price: 18500, inStock: true },
    { title: "Commuter Backpack", slug: "commuter-backpack", category: "backpacks", price: 16500, inStock: true },
  ]);

  return NextResponse.json({ seeded: true });
}
