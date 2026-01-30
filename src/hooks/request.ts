export async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);

  if (res.status === 401) {
    fetch("/api/logout", { method: "POST" }).finally(() => {
      window.location.href = "/login";
    });
    return new Promise(() => {}); 
  }

  return res;
}