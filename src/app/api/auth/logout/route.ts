import { cookies } from "next/headers";

export async function POST() {
  //TODO: expand logout to include store clearing too.
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return Response.json({ ok: true });
}
