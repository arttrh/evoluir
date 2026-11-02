import type {
  ApiRequest as VercelRequest,
  ApiResponse as VercelResponse,
} from "../server/http.js";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  seal,
  unseal,
  readCookies,
  tokenSchema,
  type StravaToken,
} from "../server/strava-session.js";
const SESSION = "__Host-evoluir-strava",
  STATE = "__Host-evoluir-oauth";
const cookie = (name: string, value: string, age: number) =>
  `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`;
const activitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().max(500),
  distance: z.number().nonnegative(),
  moving_time: z.number().int().nonnegative(),
  elapsed_time: z.number().int().nonnegative(),
  start_date: z.string().datetime(),
  sport_type: z.string(),
  total_elevation_gain: z.number().nonnegative().optional(),
  average_heartrate: z.number().optional(),
  device_name: z.string().optional(),
});
const configSchema = z.object({
  id: z.string().regex(/^\d+$/),
  secret: z.string().min(1),
  session: z.string().min(32),
  origin: z
    .string()
    .url()
    .refine((s) => new URL(s).protocol === "https:"),
});
async function tokenRequest(params: Record<string, string>) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(
      "Não foi possível renovar a autorização. Conecte sua conta novamente.",
    );
  return tokenSchema.parse(await response.json());
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie");
  const parsed = configSchema.safeParse({
    id: process.env.STRAVA_CLIENT_ID,
    secret: process.env.STRAVA_CLIENT_SECRET,
    session: process.env.STRAVA_SESSION_SECRET,
    origin: process.env.APP_ORIGIN,
  });
  const op = String(req.query.op || "status");
  const cookies = readCookies(req.headers.cookie);
  let token: StravaToken | undefined;
  if (parsed.success && cookies[SESSION])
    try {
      const session = z
        .object({ token: tokenSchema, until: z.number() })
        .parse(unseal(cookies[SESSION], parsed.data.session));
      if (session.until > Date.now()) token = session.token;
    } catch {
      /* Uma sessão adulterada nunca concede acesso. */
    }
  if (op === "status" && req.method === "GET")
    return res
      .status(200)
      .json({ configured: parsed.success, connected: Boolean(token) });
  if (!parsed.success)
    return res
      .status(503)
      .json({
        error:
          "A conexão Strava ainda não foi configurada pelo responsável pelo aplicativo.",
      });
  const config = parsed.data;
  const origin = new URL(config.origin).origin;
  const callback = `${origin}/api/strava?op=callback`;
  if (op === "connect" && req.method === "GET") {
    const state = randomBytes(32).toString("hex");
    res.setHeader(
      "Set-Cookie",
      cookie(
        STATE,
        seal({ state, until: Date.now() + 600000 }, config.session),
        600,
      ),
    );
    const url = new URL("https://www.strava.com/oauth/authorize");
    url.search = new URLSearchParams({
      client_id: config.id,
      redirect_uri: callback,
      response_type: "code",
      approval_prompt: "auto",
      scope: "read,activity:read_all",
      state,
    }).toString();
    return res.redirect(302, url.toString());
  }
  if (op === "callback" && req.method === "GET") {
    res.setHeader("Set-Cookie", cookie(STATE, "", 0));
    try {
      const state = z
        .object({ state: z.string(), until: z.number() })
        .parse(unseal(cookies[STATE] || "", config.session));
      const returned = String(req.query.state || "");
      if (
        state.until < Date.now() ||
        state.state.length !== returned.length ||
        !timingSafeEqual(Buffer.from(state.state), Buffer.from(returned))
      )
        throw new Error();
      if (
        req.query.error ||
        typeof req.query.code !== "string" ||
        !String(req.query.scope || "")
          .split(/[, ]+/)
          .includes("activity:read_all")
      )
        throw new Error();
      token = await tokenRequest({
        client_id: config.id,
        client_secret: config.secret,
        code: req.query.code,
        grant_type: "authorization_code",
      });
      res.setHeader("Set-Cookie", [
        cookie(STATE, "", 0),
        cookie(
          SESSION,
          seal({ token, until: Date.now() + 604800000 }, config.session),
          604800,
        ),
      ]);
      return res.redirect(303, `${origin}/?strava=connected`);
    } catch {
      return res.redirect(303, `${origin}/?strava=error`);
    }
  }
  if (!token)
    return res
      .status(401)
      .json({
        error: "Conecte sua conta Strava para consultar suas atividades.",
      });
  if (op === "disconnect" && req.method === "POST") {
    if (req.headers.origin !== origin)
      return res.status(403).json({ error: "Origem não permitida." });
    try {
      const response = await fetch("https://www.strava.com/oauth/deauthorize", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ access_token: token.access_token }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok)
        return res
          .status(502)
          .json({
            error:
              "Não foi possível revogar agora. Você também pode revogar em Strava → Configurações → Meus aplicativos.",
          });
      res.setHeader("Set-Cookie", cookie(SESSION, "", 0));
      return res.status(200).json({ disconnected: true });
    } catch {
      return res
        .status(502)
        .json({
          error:
            "Falha de conexão. Revogue o acesso nas configurações do Strava ou tente novamente.",
        });
    }
  }
  if (op === "activities" && req.method === "GET") {
    try {
      if (token.expires_at <= Math.floor(Date.now() / 1000) + 60) {
        token = await tokenRequest({
          client_id: config.id,
          client_secret: config.secret,
          refresh_token: token.refresh_token,
          grant_type: "refresh_token",
        });
        res.setHeader(
          "Set-Cookie",
          cookie(
            SESSION,
            seal({ token, until: Date.now() + 604800000 }, config.session),
            604800,
          ),
        );
      }
      const response = await fetch(
        "https://www.strava.com/api/v3/athlete/activities?per_page=100&page=1",
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (response.status === 429)
        return res
          .status(429)
          .json({
            error:
              "O Strava atingiu o limite de consultas. Aguarde antes de atualizar.",
          });
      if (response.status === 401) {
        res.setHeader("Set-Cookie", cookie(SESSION, "", 0));
        return res
          .status(401)
          .json({
            error: "Autorização expirada ou revogada. Conecte novamente.",
          });
      }
      if (!response.ok) throw new Error();
      const activities = z
        .array(activitySchema)
        .parse(await response.json())
        .filter((a) => ["Run", "TrailRun", "VirtualRun"].includes(a.sport_type))
        .map((a) => ({
          id: a.id,
          name: a.name,
          distance: a.distance,
          movingTime: a.moving_time,
          elapsedTime: a.elapsed_time,
          date: a.start_date,
          elevation: a.total_elevation_gain ?? null,
          heartRate: a.average_heartrate ?? null,
          device: a.device_name ?? null,
          url: `https://www.strava.com/activities/${a.id}`,
        }));
      return res
        .status(200)
        .json({ activities, checkedAt: new Date().toISOString(), limit: 100 });
    } catch {
      return res
        .status(502)
        .json({
          error:
            "Não foi possível consultar o Strava. Tente novamente ou reconecte sua conta.",
        });
    }
  }
  return res.status(405).json({ error: "Método ou operação não permitida." });
}
