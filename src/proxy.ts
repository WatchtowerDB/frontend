import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const ACCESS_MAX_AGE = Number(process.env.ACCESS_TOKEN_MAX_AGE) || 1800;

  // 1. THE "WHITELIST"
  // Allow login, logout, and the refresh endpoint to bypass the proxy
  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    console.log("12/13");
    return NextResponse.next();
  }

  // 2. ABSOLUTE LOGOUT
  // No tokens at all? Send them to login.
  if (!accessToken && !refreshToken) {
    console.log("18/19");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. REACTIVE REFRESH
  // Triggered only if the access_token is missing (expired) but we have a refresh_token
  if (!accessToken && refreshToken) {
    console.log("🛠️ Proxy: Access token missing. Attempting silent refresh...");

    const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      // const response = NextResponse.next();

      const response = NextResponse.json(
        { message: "TOKEN_REFRESHED" },
        { status: 409 }, // 409 Conflict is often used to say "State changed, try again"
      );
      // Relay the new token back to the browser
      console.log("Hey Ya!", data)
      response.cookies.set("access_token", data.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_MAX_AGE,
      });

      console.log("✅ Proxy: Token refreshed successfully.");
      return response;
    } else {
      // Refresh failed (likely refresh_token is also expired or invalid)
      const loginRes = NextResponse.redirect(
        new URL("/login?reason=expired", req.url),
      );
      loginRes.cookies.delete("access_token");
      loginRes.cookies.delete("refresh_token");
      return loginRes;
    }
  }

  // 4. ALLOW AUTHORIZED REQUEST
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
