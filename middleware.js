// admin/middleware.js (Edge-safe; no DB imports)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Public routes (adjust as you need)
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth"); // next-auth callbacks

  if (isPublic) return NextResponse.next();

  // Read JWT only (no DB calls here)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Admin area: must be logged in and have role=admin in the JWT
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search)}`, req.url)
      );
    }
    if (token.role !== "admin") {
      // not an admin — push them to home (or show 403 page if you have one)
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Other private routes (example)
  const needsAuth =
    pathname.startsWith("/user") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/store/new");

  if (needsAuth && !token) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Only run on private areas — keeps middleware light
  matcher: ["/admin/:path*", "/user/:path*", "/cart", "/store/new"],
};
