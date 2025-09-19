// admin/middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname || "/";

      // 1) Public auth pages
      if (path.startsWith("/login") || path.startsWith("/register")) {
        return true;
      }

      // 2) Admin-only areas
      if (path.startsWith("/dashboard") || path.startsWith("/analytics")) {
        return !!token && token.role === "admin";
      }

      // 3) Signed-in user area
      if (path.startsWith("/profile")) {
        return !!token;
      }

      // 4) Everything else in the admin app can be public,
      //    or change to `return !!token;` if you want all other pages gated.
      return true;
    },
  },
});

// Only run middleware on real pages. Exclude /api and static assets.
export const config = {
  matcher: [
    // Run on everything EXCEPT: /api, Next internals, and common static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)).*)",
  ],
};
