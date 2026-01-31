import { NextResponse, NextRequest } from "next/server";
import {
  fetchAssertions,
  fetchAssertionsBySchema,
  runComplianceCheck,
} from "@/lib/api/compliance";
import { cookies } from "next/headers";

async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token;
}

// const cookieStore = await cookies();
// const token = cookieStore.get("access_token")?.value;

//This is for fetching all the assertions, or fetching by schema ID if it's given
export async function GET(req: NextRequest) {
  //Todo, emphasize on using NextRequest vs just Request.
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check for the query parameter
    const { searchParams } = new URL(req.url);
    const schemaId = searchParams.get("schema_id");

    let data;

    if (schemaId) {
      // 2. If ID exists, call the filtered version
      console.log(`Fetching assertions for schema: ${schemaId}`);
      data = await fetchAssertionsBySchema(token, parseInt(schemaId));
    } else {
      // 3. Otherwise, fetch everything
      console.log("Fetching all assertions");
      data = await fetchAssertions(token);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.status === 401) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// This is to ask for the compliance check. basically starts up the pipeline.
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
    const body = await req.json();
    const result = await runComplianceCheck(token, {
      framework: body.framework,
      schema: body.schema,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.status === 401) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to start compliance check:", err);
    return NextResponse.json(
      { error: "Failed to start compliance check" },
      { status: 500 },
    );
  }
}
