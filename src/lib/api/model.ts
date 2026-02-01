import { cookies } from "next/headers";

//starts the pipeline
export async function initializeModel(
  token: string,
) {
  // console.log("We made it to api ts");
  // console.log("here damn", token, data)
  const res = await fetch(`${process.env.BACKEND_URL}/api/compliance/model/init/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Cuz i think we will need this. WE DO NEED THIS.
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to initialize model");
  }

  return res.json();
}

