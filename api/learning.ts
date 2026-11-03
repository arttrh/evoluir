import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { readBounded, type ApiRequest, type ApiResponse } from "../server/http.js";

export const maxDuration = 60;
export const learningLinkSchema = z.object({
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  trackId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  topicId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
}).strict();

function origin(value: string | undefined) {
  const parsed = new URL(value || "");
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.port || parsed.pathname !== "/") throw new Error("Origem inválida.");
  return parsed.origin;
}
export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    if (req.query.op === "open" && req.method === "GET") {
      const target = origin(process.env.LEARNHARNESS_URL);
      const endpoint = new URL(process.env.PRUMO_STORE_URL || "");
      if (endpoint.protocol !== "https:" || endpoint.hostname !== "atzncofgyitahiguuhcn.supabase.co" || endpoint.pathname !== "/functions/v1/prumo-lh-store" || endpoint.search || endpoint.hash)
        throw new Error("Persistência inválida.");
      const key = process.env.PRUMO_GATEWAY_KEY;
      if (!key || key.length < 43 || !new URL(target).hostname.endsWith(".onrender.com")) throw new Error("Integração não configurada.");
      const ready = await fetch(`${target}/prumo/records`, { headers: { "x-prumo-gateway": key }, redirect: "error", signal: AbortSignal.timeout(40000) });
      await ready.body?.cancel();
      if (!ready.ok) throw new Error("O ambiente está iniciando.");
      const ticket = randomBytes(32).toString("base64url");
      const response = await fetch(endpoint, { method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ticket", id: randomUUID(), key: createHash("sha256").update(ticket).digest("hex") }) });
      if (!response.ok) throw new Error("Não foi possível abrir o acesso.");
      const nonce = randomBytes(18).toString("base64url");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Referrer-Policy", "no-referrer");
      res.setHeader("Content-Security-Policy", `default-src 'none'; script-src 'nonce-${nonce}'; form-action ${target}; base-uri 'none'; frame-ancestors 'none'`);
      return res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Abrindo estudos</title><body><p>Abrindo seu ambiente privado de estudos…</p><form method="post" action="${target}/prumo/access"><input type="hidden" name="ticket" value="${ticket}"><button>Continuar para o LearnHarness</button></form><script nonce="${nonce}">document.querySelector('form').submit()</script></body></html>`);
    }
    if (!["GET", "POST"].includes(req.method || "")) return res.status(405).json({ error: "Método não permitido." });
    const backend = origin(process.env.JAVA_BACKEND_URL), key = process.env.JAVA_BACKEND_KEY;
    if (!key || key.length < 32) throw new Error("Backend não configurado.");
    let body: string | undefined;
    if (req.method === "POST") {
      if (req.headers.origin !== (process.env.APP_ORIGIN || "https://evoluir-hazel.vercel.app")) return res.status(403).json({ error: "Origem não autorizada." });
      if (!req.headers["content-type"]?.startsWith("application/json")) return res.status(415).json({ error: "Envie um vínculo JSON." });
      let candidate = (req as ApiRequest & { body?: unknown }).body;
      if (candidate === undefined) {
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk);
          if (size > 1024) return res.status(413).json({ error: "Vínculo acima do limite." });
          chunks.push(Buffer.from(chunk));
        }
        candidate = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      }
      const parsed = learningLinkSchema.safeParse(candidate);
      if (!parsed.success) return res.status(400).json({ error: "Confira o vínculo da sessão." });
      body = JSON.stringify(parsed.data);
    }
    const response = await fetch(new URL("/api/study-sessions", backend), { method: req.method, body,
      headers: { "X-Prumo-Backend-Key": key, "Content-Type": "application/json" }, redirect: "error", signal: AbortSignal.timeout(55000) });
    const text = await readBounded(response);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(response.status).end(text);
  } catch {
    if (req.method === "GET" && req.query.op === "open") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(503).end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ambiente de estudos</title><body><h1>O ambiente de estudos está iniciando</h1><p>Aguarde um minuto e tente novamente. Seus estudos permanecem salvos.</p><a href="/api/learning?op=open">Tentar novamente</a> · <a href="/">Voltar ao Prumo</a></body></html>');
    }
    return res.status(503).json({ error: "O ambiente de estudos está iniciando ou indisponível. Aguarde um minuto e tente novamente." });
  }
}
