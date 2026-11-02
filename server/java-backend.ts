import type { ApiRequest, ApiResponse } from "./http.js";
import { readBounded } from "./http.js";

type JavaPath = "/api/jobs" | "/api/news" | "/api/study-search" | "/api/strava";

export async function forwardToJava(req: ApiRequest, res: ApiResponse, path: JavaPath): Promise<boolean> {
  const configured = process.env.JAVA_BACKEND_URL;
  if (!configured) return false;
  res.setHeader("Cache-Control", "private, no-store");
  try {
    const origin = new URL(configured);
    const key = process.env.JAVA_BACKEND_KEY;
    const local = process.env.VERCEL !== "1" && origin.protocol === "http:" && ["127.0.0.1", "localhost"].includes(origin.hostname);
    if ((!local && origin.protocol !== "https:") || origin.username || origin.password || origin.search || origin.hash
        || origin.pathname !== "/" || !key || key.length < 32) throw new Error("Configuração Java inválida.");
    const url = new URL(path, origin);
    for (const [name, value] of Object.entries(req.query)) {
      for (const part of Array.isArray(value) ? value : value === undefined ? [] : [value]) url.searchParams.append(name, part);
    }
    const headers: Record<string, string> = { "X-Prumo-Backend-Key": key, Accept: "application/json" };
    if (path === "/api/strava") {
      if (typeof req.headers.cookie === "string") headers.Cookie = req.headers.cookie;
      if (typeof req.headers.origin === "string") headers.Origin = req.headers.origin;
    }
    const response = await fetch(url, { method: req.method || "GET", headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
    const body = response.body ? await readBounded(response) : "";
    const cookies = response.headers.getSetCookie();
    if (cookies.length && path === "/api/strava") res.setHeader("Set-Cookie", cookies);
    const location = response.headers.get("Location");
    if (location && path === "/api/strava") res.setHeader("Location", location);
    if (path === "/api/strava") res.setHeader("Vary", "Cookie");
    res.status(response.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(body);
  } catch {
    res.status(503).json({ error: "O backend Java não está disponível. Tente novamente em alguns minutos." });
  }
  return true;
}
