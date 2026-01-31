export async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);

  if (res.status === 401) {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/login?reason=expired";
    });
    return new Promise(() => {}); 
  }

  return res;
}