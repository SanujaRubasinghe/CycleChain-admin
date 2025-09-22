import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
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

/** GET /api/products/[id] */
export async function GET(_req, { params }) {
  await dbConnect();
  const {id} = await params
  const p = await Product.findById(id).lean();
  if (!p) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

/** PATCH /api/products/[id] (multipart) */
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const {id} = await params
  if (!session?.user?.role || session.user.role !== "admin") return forbid();

  await dbConnect();

  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const form = await req.formData();

  const title = form.get("title");
  const category = form.get("category");
  const price = form.get("price");
  const inStock = form.get("inStock");
  const imageFile = form.get("image");

  if (title) {
    product.title = String(title);
    let base = slugify(product.title);
    if (!base) base = crypto.randomBytes(4).toString("hex");
    let slug = base;
    let i = 1;
    while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
      slug = `${base}-${i++}`;
    }
    product.slug = slug;
  }

  if (category) product.category = String(category).toLowerCase();
  if (price !== null && price !== undefined && price !== "") {
    const n = Number(price);
    if (Number.isNaN(n)) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    }
    product.price = n;
  }
  if (inStock !== null && inStock !== undefined) {
    product.inStock =
      String(inStock) === "true" || String(inStock) === "on";
  }

  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    const url = await saveFile(imageFile);
    product.image = url;
  }

  await product.save();
  return NextResponse.json(product);
}

/** DELETE /api/products/[id] */
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  const {id} = await params
  if (!session?.user?.role || session.user.role !== "admin") return forbid();

  await dbConnect();

  const p = await Product.findByIdAndDelete(id);
  if (!p) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // (Optional) also remove the image file from disk if you want.

  return NextResponse.json({ ok: true });
}