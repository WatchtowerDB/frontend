import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // 1. Define paths that don't require a token
  const isAuthPage = pathname === "/login";
  const isPublicApi = pathname.startsWith("/api/auth"); // e.g., your actual login endpoint
  const isHealthCheck = pathname === "/api/health";

  // 2. Scenario: No token and trying to access a protected route
  if (isAuthPage || isPublicApi || isHealthCheck) {
    // Special case: If they have a token but try to go to /login, send to dashboard
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. PROTECTED ROUTES
  // If no token exists and they aren't on a whitelisted path
  if (!token) {
    // Handle API requests with a 401 status instead of a redirect
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle Page requests by redirecting to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. AUTHORIZED
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
