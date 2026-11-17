// Vercel serverless function: keeps the CounterAPI token out of browser code.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const workspace = process.env.COUNTERAPI_WORKSPACE;
  const token = process.env.COUNTERAPI_TOKEN;
  if (!workspace || !token) {
    return res.status(503).json({ error: "View counter is not configured" });
  }

  try {
    const endpoint = `https://api.counterapi.dev/v2/${encodeURIComponent(workspace)}/portfolio-views/up`;
    const upstream = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store"
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(502).json({ error: "Counter service error" });
    }

    const rawValue = payload?.value ?? payload?.data?.value ?? payload?.data;
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      return res.status(502).json({ error: "Unexpected counter response" });
    }
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ value });
  } catch {
    return res.status(502).json({ error: "Unable to record page view" });
  }
}
