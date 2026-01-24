import { NextResponse } from "next/server";
import { fetchAssertions, runComplianceCheck } from "@/lib/compliance/api";

function getTokenFromCookies(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/authtoken=([^;]+)/);
  return match ? match[1] : null;
}

//This is for fetching all the assertions.
export async function GET(req: Request) {
  try {
    const token = getTokenFromCookies(req);
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const schemas = await fetchAssertions(token);

    return new Response(JSON.stringify(schemas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// This is to ask for the compliance check. basically starts up the pipeline.
export async function POST(req: Request) {
  console.log("Route.ts pipeline start reached");
  try {
    const token = getTokenFromCookies(req);
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const result = await runComplianceCheck(token, {
      framework: body.framework,
      schema: body.schema,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Failed to start compliance check:", err);
    return NextResponse.json(
      { error: "Failed to start compliance check" },
      { status: 500 },
    );
  }
}
