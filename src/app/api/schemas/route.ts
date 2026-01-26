import { fetchSchemas, uploadSchema } from "@/lib/api/compliance";

// Helper to extract token from cookies
function getTokenFromCookies(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/authtoken=([^;]+)/);
  return match ? match[1] : null;
}

//To load all the schemas.
export async function GET(req: Request) {
  try {
    const token = getTokenFromCookies(req);
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const schemas = await fetchSchemas(token);

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

export async function POST(req: Request) {
  try {
    const token = getTokenFromCookies(req);
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { schemaJson, clientDb } = body;

    if (!schemaJson || !clientDb) {
      return new Response(
        JSON.stringify({ error: "Missing schemaJson or clientDb" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await uploadSchema(schemaJson, clientDb, token);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}