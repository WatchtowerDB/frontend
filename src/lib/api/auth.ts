export async function login(username: string, password: string) {
  const res = await fetch(`${process.env.BACKEND_URL}/auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  console.log("Invalid credentials have the response:", res);

  if (res.status === 401) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (res.status !== 200) {
    throw new Error(`Unexpected error: ${res.status}`);
  }
  return (await res.json()) as {
    access: string;
    refresh?: string;
  };
}
