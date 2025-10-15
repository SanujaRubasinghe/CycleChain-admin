import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "file required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = join(process.cwd(), "public", "uploads");
  try { await stat(uploadDir); } catch { await mkdir(uploadDir, { recursive: true }); }

  const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
  const name = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const filepath = join(uploadDir, name);

  await new Promise((res, rej) => {
    const ws = createWriteStream(filepath);
    ws.on("error", rej);
    ws.on("finish", res);
    ws.end(buffer);
  });

  // public URL
  const url = `/uploads/${name}`;
  return NextResponse.json({ url }, { status: 201 });
}
