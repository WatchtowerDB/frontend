import { cookies } from "next/headers";
import { login } from "@/lib/api/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const body = await req.json();
  try {
    const data = await login(body.username, body.password);

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    // to better understand this, because it's beautiful, i will comment the explanation on every single flag
    cookieStore.set("access_token", data.access, {
      ...cookieOptions,
      maxAge: 1800,
      //Since we are running on localhost (HTTP), most likely anyway, it will remain off.
      //I love next.js <3
    });

    cookieStore.set("refresh_token", data.refresh, {
      ...cookieOptions,
      maxAge: 2000, // TODO. Change this. This is 2000 for testing purposes. assume it's around 43200 (12h) for anything else.
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
