import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("token and pathname are", token, pathname);
  if (token && pathname === "/login") {
    console.log("It hsould redirect to dashboard now");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // allow the request to continue
  return NextResponse.next();
}

// specify which routes to NOT protect in our case.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
