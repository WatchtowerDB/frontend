export const fetchAssertions = async (token: string) => {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/compliance/assertions`,
    {
      cache: "no-store", // ensures SSR fetch on every request. Which is good!
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch assertions: ${errorText}`);
  }

  const data: AssertionsResponse = await response.json();
  console.log(data);
  return data;
};

export async function runComplianceCheck(
  token: string,
  data: {
    framework: number;
    schema: number;
  },
) {
  console.log("We made it to api ts");
  console.log("here damn", token, data)
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/compliance/checks/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Cuz i think we will need this. WE DO NEED THIS.
      },
      body: JSON.stringify(data),
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to run compliance check");

  return res.json();
}

// upload new schemas..
export const uploadSchema = async (
  schemaJson: string,
  clientDb: number,
  token: string,
) => {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/compliance/clientdbschema`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        schema_json: schemaJson,
        client_db: clientDb,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload schema: ${errorText}`);
  }

  return response.json();
};

// Fetch existing schemas from backend
export const fetchSchemas = async (token: string) => {
  console.log("There's a consolel og in api.ts fetchscemas");
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/compliance/clientdbschema`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch schemas: ${errorText}`);
  }
  const data: SchemaResponse = await response.json();
  // console.log("This has been fetched, and the data is OFFICIALLY, ", data.results.map((item) => item.schema_json));
  // return data.results.map((item) => item.schema_json);
  console.log(data);
  return data;
};

//To update a schema.
export const updateSchema = async (
  id: string,
  schemaJson: string,
  clientDb: number,
  token: string,
) => {
  console.log("we mad eit thsi FAR to api.ts", id, schemaJson, clientDb, token);
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/compliance/clientdbschema/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        schema_json: schemaJson,
        client_db: clientDb, //Todo: figure out client DB.
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update schema: ${errorText}`);
  }

  return response.json();
};
