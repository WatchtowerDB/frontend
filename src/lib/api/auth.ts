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
    refresh: string;
  };
}

export async function refreshToken(refresh_token: string) {
  console.log("refresh token is", refresh_token)
  const res = await fetch(`${process.env.BACKEND_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh_token }),
    cache: "no-store",
  });

  console.log("Invalid refresh:", res);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (res.status !== 200) {
    throw new Error(`Unexpected error: ${res.status}`);
  }
  return (await res.json()) as {
    access: string;
  };
}
