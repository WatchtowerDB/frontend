import { cookies } from "next/headers";
import { login } from "@/lib/api/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const body = await req.json();
  try {
    const data = await login(body.username, body.password);
    // to better understand this, because it's beautiful, i will comment the explanation on every single flag
    cookieStore.set("access_token", data.access, {
      httpOnly: true, // meaning JS can not read this cookie, purely for safety purposes.
      sameSite: "lax", // cross-site requests, lax means its on top level navigation only
      secure: process.env.NODE_ENV === "production", //if true, all cookies will ONLY be sent over HTTPS.
      //Since we are running on localhost (HTTP), most likely anyway, it will remain off.
      //I love next.js <3
      path: "/", //cookies apply to all routes.
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
