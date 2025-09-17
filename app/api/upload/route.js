import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function POST(req) {
  // 1. Require admin role
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2. Read form data
  const form = await req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  // 3. Validate mime type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "Unsupported file type" }, { status: 415 });
  }

  // 4. Build upload path: public/uploads/YYYYMM/uuid.ext
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ext = ({
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  })[file.type];
  const filename = crypto.randomUUID() + ext;

  const relDir = path.posix.join("uploads", ym);
  const absDir = path.join(process.cwd(), "public", relDir);

  await fs.mkdir(absDir, { recursive: true });

  // 5. Write file to /public/uploads
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(absDir, filename), buffer);

  // 6. Return public URL
  const url = `/${relDir}/${filename}`;
  return NextResponse.json({ url });
}
