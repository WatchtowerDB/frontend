import { cookies } from "next/headers";
import { login } from "@/lib/api/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const body = await req.json();
  const ACCESS_MAX_AGE = Number(process.env.ACCESS_TOKEN_MAX_AGE) || 1800;
  const REFRESH_MAX_AGE = Number(process.env.REFRESH_TOKEN_MAX_AGE) || 3600; // TODO, Change this to your heart's content.
  try {
    const data = await login(body.username, body.password);

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    // to better understand this, because it's beautiful, i will comment the explanation on every single flag
    console.log("THIS HAS BEEN TRIGGERED IN LOGIN/ROUTE!!!!");
    cookieStore.set("access_token", data.access, {
      ...cookieOptions,
      maxAge: ACCESS_MAX_AGE,
      //Since we are running on localhost (HTTP), most likely anyway, it will remain off.
      //I love next.js <3
    });

    cookieStore.set("refresh_token", data.refresh, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });

    return Response.json({ ok: true });
  } catch (error: any) {
    //could define the error type, TODO ig.
    if (error.message === "INVALID_CREDENTIALS") {
      return Response.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    return Response.json(
      { message: "Something went wrong on our end." },
      { status: 500 },
    );
  }
}
