// middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // redirect here if not logged in
  },
});

// Protect only these routes
export const config = {
  matcher: [
    "/cart/:path*",      // cart page
    "/checkout/:path*",  // checkout page (if you add it)
    // add more protected routes if needed
  ],
};
