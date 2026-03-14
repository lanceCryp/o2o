import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)?|jpe?g|webp|png|gif|svg|ttf|eot?.+?|otf?|woff|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Protect dashboard and room routes
    "/dashboard/:path*",
    "/room/:path*",
  ],
};
