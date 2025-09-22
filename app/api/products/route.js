import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Product from "@/models/Product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

async function saveFile(file) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext =
    (file.name && path.extname(file.name)) ||
    (file.type && `.${file.type.split("/")[1]}`) ||
    "";
  const name = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, name);
  await writeFile(fullPath, bytes);
  return `/uploads/products/${name}`;
}

function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function GET() {
  await connectToDB();
  const docs = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return forbid();

  await connectToDB();

  const form = await req.formData();
  const title = form.get("title");
  const category = String(form.get("category") || "").toLowerCase();
  const price = Number(form.get("price"));
  const inStock = String(form.get("inStock")) === "true" || form.get("inStock") === "on";
  const imageFile = form.get("image");

  if (!title || !category || Number.isNaN(price)) {
    return NextResponse.json(
      { message: "title, category and price are required" },
      { status: 400 }
    );
  }

  // unique slug from title
  let base = slugify(title);
  if (!base) base = crypto.randomBytes(4).toString("hex");
  let slug = base;
  let i = 1;
  while (await Product.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }

  let imageUrl = "";
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    imageUrl = await saveFile(imageFile);
  }

  const doc = await Product.create({
    title,
    slug,
    category,
    price,
    image: imageUrl,
    inStock,
  });

  return NextResponse.json(doc, { status: 201 });
}
