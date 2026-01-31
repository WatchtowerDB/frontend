import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const { pathname } = req.nextUrl;

  if (!accessToken && !refreshToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (accessToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let shouldRefresh = false;

  if (accessToken) {
    try {
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));

      const exp = payload.exp * 1000;
      const buffer = 2 * 60 * 1000; // 2 minute buffer
      
      if (Date.now() > exp - buffer) {
        console.log(" Proxy: Token expiring soon.");
        shouldRefresh = true;
      }
    } catch (e) {
      console.error(" Proxy: Failed to parse JWT, forcing refresh as fallback.");
      shouldRefresh = true;
    }
  } else if (refreshToken) {
    shouldRefresh = true;
  }

  if (shouldRefresh && refreshToken && pathname !== "/login") {
    console.log("Proxy: Attempting silent refresh...");

    const refreshUrl = new URL("/api/auth/refresh", req.url);

    try {
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(" Proxy: Silent refresh successful!");

        const response = NextResponse.next();
        response.cookies.set("access_token", data.access, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 1800,
        });

        return response;
      } else {
        const loginRes = NextResponse.redirect(new URL("/login?reason=expired", req.url));
        loginRes.cookies.delete("access_token");
        loginRes.cookies.delete("refresh_token");
        return loginRes;
      }
    } catch (error) {
      console.error("Proxy: Critical error during fetch:", error);
      return NextResponse.redirect(new URL("/login?reason=expired", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};