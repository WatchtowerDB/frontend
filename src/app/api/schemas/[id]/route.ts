//Right now, this whole file is depricated. Updating schemas is not an option.

// import { updateSchema } from "@/lib/api/compliance";

// Helper to extract token from cookies
function getTokenFromCookies(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/authtoken=([^;]+)/);
  return match ? match[1] : null;
}

// To Update a Schema (TUaS)
// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ id: string }> },
// ) {
//   const params = await context.params; 
//   try {
//     const token = getTokenFromCookies(req);
//     if (!token) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const { id } = params; // 👈 FROM URL
//     const body = await req.json();
//     const { schemaJson, clientDb } = body;

//     if (!id || !schemaJson || !clientDb) {
  
//       return new Response(
//         JSON.stringify({ error: "Missing id, schemaJson, or clientDb" }),
//         { status: 400, headers: { "Content-Type": "application/json" } },
//       );
//     }
//     const result = await updateSchema(id, schemaJson, clientDb, token);

//     return new Response(JSON.stringify(result), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err: any) {
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
