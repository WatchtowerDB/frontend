import { NextResponse, NextRequest } from "next/server";
import {
  fetchAssertions,
  fetchAssertionsBySchema,
  runComplianceCheck,
} from "@/lib/api/compliance";
import { cookies } from "next/headers";
import { initializeModel } from "@/lib/api/model";

async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token;
}

export async function POST(req: Request) {
  console.log("Route.ts pipeline start reached");
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await initializeModel(token);

    return NextResponse.json(result, { status: 202 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.status === 401) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to initiate model:", err);
    return NextResponse.json(
      { error: "Failed to initiate model" },
      { status: 500 },
    );
  }
}
