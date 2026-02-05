import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Stripe webhook — must be accessible without session
  if (pathname === "/api/billing/webhook") {
    return NextResponse.next();
  }

  // CORS for public API v1
  if (pathname.startsWith("/api/v1")) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
    return response;
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );

  // Auth API is always accessible
  if (isPublicRoute || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for session cookie (no DB calls at edge)
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Protected dashboard routes — redirect to login
  if (!sessionToken && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected API routes — return JSON 401
  if (!sessionToken && pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
