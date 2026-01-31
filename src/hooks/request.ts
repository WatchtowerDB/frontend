export async function request(url: string, options: RequestInit = {}): Promise<Response> {
  let res = await fetch(url, options);

  // 1. CATCH THE 409 (RETRY SIGNAL)
  // If the middleware/route sent a 409, it means "I just updated your cookies, try again"
  if (res.status === 409) {
    console.warn("🔄 Token refreshed in background. Retrying request...");
    // We overwrite 'res' with a second attempt. 
    // This attempt will automatically carry the NEW cookies the browser just received.
    res = await fetch(url, options);
  }

  // 2. CATCH THE ACTUAL 401 (SESSION DEATH)
  // If it's still 401 after the retry, then the refresh failed or the refresh token is dead.
  if (res.status === 401) {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/login?reason=expired";
    });
    return new Promise(() => {}); 
  }

  return res;
}