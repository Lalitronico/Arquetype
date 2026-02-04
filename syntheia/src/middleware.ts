import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );

  // Auth API and V1 API (uses API key auth, not session) are always accessible
  if (isPublicRoute || pathname.startsWith("/api/auth") || pathname.startsWith("/api/v1")) {
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
