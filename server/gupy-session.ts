import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";
import { readBounded } from "./http.js";

// shortcut: endpoint usado pelo portal, rever o contrato se a Gupy alterar a autenticação.
export const gupyAccountUrl = "https://private-api.gupy.io/authentication/candidate/account/current";
const header = z.string().min(1).max(16000).refine(value => !/[\r\n]/.test(value));
const sessionSchema = z.object({ authorization: header.optional(), cookie: header.optional(), userAgent: header.optional() })
  .strict().refine(value => Boolean(value.authorization || value.cookie));
export const sealedGupySchema = z.object({
  iv: z.string().regex(/^[a-f0-9]{24}$/), tag: z.string().regex(/^[a-f0-9]{32}$/),
  data: z.string().min(1).max(100000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
}).strict();

function sessionKey(key: string) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("Chave de sessão inválida.");
  return Buffer.from(key, "hex");
}

export function sealGupySession(input: unknown, key: string) {
  const session = sessionSchema.parse(input);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(key), iv);
  cipher.setAAD(Buffer.from("prumo-gupy-session-v1"));
  const data = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return { iv: iv.toString("hex"), tag: cipher.getAuthTag().toString("hex"), data: data.toString("base64") };
}

export function openGupySession(input: unknown, key: string) {
  const sealed = sealedGupySchema.parse(input);
  const decipher = createDecipheriv("aes-256-gcm", sessionKey(key), Buffer.from(sealed.iv, "hex"));
  decipher.setAAD(Buffer.from("prumo-gupy-session-v1"));
  decipher.setAuthTag(Buffer.from(sealed.tag, "hex"));
  const raw = Buffer.concat([decipher.update(Buffer.from(sealed.data, "base64")), decipher.final()]);
  return sessionSchema.parse(JSON.parse(raw.toString("utf8")));
}

export async function verifyGupySession(input: unknown, key: string) {
  const session = openGupySession(input, key);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (session.authorization) headers.Authorization = session.authorization;
  if (session.cookie) headers.Cookie = session.cookie;
  if (session.userAgent) headers["User-Agent"] = session.userAgent;
  const response = await fetch(gupyAccountUrl, { headers, redirect: "error", signal: AbortSignal.timeout(15000) });
  if (response.status === 401 || response.status === 403) return false;
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("A Gupy não confirmou a sessão.", { cause: `gupy_http_${response.status}` });
  const body = JSON.parse(await readBounded(response, 500000));
  if (!body || typeof body !== "object" || Array.isArray(body) || !Object.keys(body).length || body.error)
    throw new Error("A Gupy não confirmou a sessão.", { cause: "gupy_unexpected_shape" });
  return true;
}
