export async function pingBackend() {
  const start = Date.now();

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/compliance/assertions`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      ok: !!res,
      latency: Date.now() - start,
    };
  } finally {
    clearTimeout(id);
  }
}
