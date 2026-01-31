import { cookies } from "next/headers";
import { refreshToken } from "@/lib/api/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const body = await req.json();
  try {
    console.log("route.ts in refresh says that the refresh token is", body);
    const data = await refreshToken(body.refresh);

    // cookieStore.set("access_token", data.access, {
    //   maxAge: 1800,
    //   httpOnly: true,
    //   sameSite: "lax" as const,
    //   secure: process.env.NODE_ENV === "production",
    //   path: "/",
    // });

    return Response.json({ ok: true });
  } catch (error: any) {
    //could define the error type, TODO ig.
    if (error.message === "UNAUTHORIZED") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    return Response.json(
      { message: "Something went wrong on our end." },
      { status: 500 },
    );
  }
}
