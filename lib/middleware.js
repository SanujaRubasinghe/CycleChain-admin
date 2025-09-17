// middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // Always allow login/register
      if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        return true;
      }

      // Admin-only routes
      if (pathname.startsWith("/admin")) {
        return token?.role === "admin";
      }

      // Auth required routes → redirect guests to /store
      if (
        pathname.startsWith("/cart") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/user")
      ) {
        if (!token) {
          // manual redirect to /store
          return NextResponse.redirect(new URL("/store", req.nextUrl.origin));
        }
        return true;
      }

      // Everything else (like /store) is public
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/user/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
