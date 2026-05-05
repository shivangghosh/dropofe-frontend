import { authMiddleware } from "@clerk/nextjs";

// Use Clerk authMiddleware so server-side `auth()` calls work
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)?",
    "/sign-up(.*)?",
    "/_next/static(.*)?",
    "/_next/image(.*)?",
    "/favicon.ico",
  ],
});

// Ensure the middleware runs for all app routes except Next.js internals
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
