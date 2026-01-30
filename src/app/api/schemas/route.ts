import { fetchSchemas, uploadSchema } from "@/lib/api/compliance";
import { cookies } from "next/headers";

// Helper to extract token from cookies
async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token;
}

//To load all the schemas.
export async function GET(req: Request) {
  try {
    const token = await getTokenFromCookies();
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
    if (err.message === "UNAUTHORIZED" || err.status === 401) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// To add a schema:
export async function POST(req: Request) {
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    // const { schemaJson, clientDb } = body;
    console.log("hello, body is he", body);

    // if (!schemaJson || !clientDb) {
    //   console.log("Oddd condition line 51 met")
    //   console.log("schema json is", schemaJson)
    //   console.log("clientDb is", clientDb)
    //   return new Response(
    //     JSON.stringify({ error: "Missing schemaJson or clientDb" }),
    //     { status: 400, headers: { "Content-Type": "application/json" } },
    //   );
    // }

    const result = await uploadSchema(body.schema_json, body.client_db, token);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.status === 401) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

//Leaving this as an example for a more detailed error handlement
//I wanna confirm if it's necessary or not, TODO.
//export async function POST(req: Request) {
//   try {
//     const token = await getTokenFromCookies();
//     if (!token) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const body = await req.json();
//     const { schemaJson, clientDb } = body;
//     console.log("hello, body is he", body);

//     if (!schemaJson || !clientDb) {
//       console.log("Oddd condition line 51 met")
//       console.log("schema json is", schemaJson)
//       console.log("clientDb is", clientDb)
//       return new Response(
//         JSON.stringify({ error: "Missing schemaJson or clientDb" }),
//         { status: 400, headers: { "Content-Type": "application/json" } },
//       );
//     }

//     const result = await uploadSchema(schemaJson, clientDb, token);

//     return new Response(JSON.stringify(result), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err: any) {
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
