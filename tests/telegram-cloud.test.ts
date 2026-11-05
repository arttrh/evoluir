import { afterEach, expect, it, vi } from "vitest";
import { once } from "node:events";
import type { Server } from "node:http";
import { createHmac } from "node:crypto";
import { authorized, authorizedScan, incomingJson, startTelegramWeb } from "../server/telegram-cloud";
import { TelegramWorker } from "../server/telegram";
import { sealGupySession, gupyAccountUrl } from "../server/gupy-session";
import { digest, openPrivate } from "../server/candidate-profile";

let server: Server | undefined;
const settings = {
  TELEGRAM_BOT_TOKEN: `123456789:${"A".repeat(35)}`, TELEGRAM_PAIR_CODE: "a".repeat(24),
  TELEGRAM_WEBHOOK_SECRET: "b".repeat(64), TELEGRAM_SCAN_SECRET: "c".repeat(64),
  TELEGRAM_STORE_TOKEN: "d".repeat(64), TELEGRAM_STORE_URL: "https://example.supabase.co/functions/v1/prumo-telegram-store", PORT: "0",
};
const realFetch = globalThis.fetch;
afterEach(async () => {
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server!.close(() => resolve())); server = undefined; }
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
async function listen(extra: NodeJS.ProcessEnv = {}) {
  server = await startTelegramWeb({ ...settings, ...extra });
  if (!server.listening) await once(server, "listening");
  return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}
it("compara credenciais sem aceitar ausentes, arrays ou comprimento diferente", () => {
  expect(authorized(undefined, "secret")).toBe(false);
  expect(authorized(["secret"], "secret")).toBe(false);
  expect(authorized("secre", "secret")).toBe(false);
  expect(authorized("secret", "secret")).toBe(true);
});
function scanHeaders(timestamp = Math.floor(Date.now() / 1000).toString()) {
  return { "x-prumo-timestamp": timestamp,
    "x-prumo-signature": createHmac("sha256", settings.TELEGRAM_SCAN_SECRET).update(`scan:${timestamp}`).digest("hex") };
}
it("o agendamento exige assinatura válida e recusa assinaturas vencidas", () => {
  const timestamp = "1793847600";
  const headers = scanHeaders(timestamp);
  const now = Number(timestamp) * 1000;
  expect(authorizedScan(timestamp, headers["x-prumo-signature"], settings.TELEGRAM_SCAN_SECRET, now)).toBe(true);
  expect(authorizedScan(timestamp, headers["x-prumo-signature"], settings.TELEGRAM_SCAN_SECRET, now + 301000)).toBe(false);
  expect(authorizedScan(timestamp, headers["x-prumo-signature"], "wrong", now)).toBe(false);
  expect(authorizedScan(undefined, headers["x-prumo-signature"], settings.TELEGRAM_SCAN_SECRET, now)).toBe(false);
});
it("limita o corpo antes de interpretar o JSON", async () => {
  async function* chunks() { yield Buffer.from('{"a":'); yield Buffer.from('"123456"}'); }
  await expect(incomingJson(chunks(), 8)).rejects.toThrow("muito grande");
  expect(await incomingJson(chunks())).toEqual({ a: "123456" });
});
it("saúde não expõe dados e rotas privadas recusam requisições sem segredo", async () => {
  const remote = vi.fn(); vi.stubGlobal("fetch", remote);
  const origin = await listen();
  expect(await (await realFetch(`${origin}/health`)).json()).toEqual({ ok: true });
  for (const path of ["/scan", "/webhook", "/gupy/connect"]) expect((await realFetch(`${origin}${path}`, { method: "POST", body: "{}" })).status).toBe(401);
  expect(remote).not.toHaveBeenCalled();
});
it("só confirma o webhook depois de persistir e ignora a repetição do update", async () => {
  let state: unknown = {}; let revision = 0; let telegramCalls = 0;
  vi.spyOn(TelegramWorker.prototype, "scan").mockResolvedValue(undefined);
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (String(url).startsWith("https://api.telegram.org/")) { telegramCalls++; return Response.json({ ok: true, result: true }); }
    const command = JSON.parse(String(init.body));
    if (command.op === "acquire") return Response.json({ state, revision });
    if (command.op === "save") { state = command.state; revision++; return Response.json({ revision }); }
    return Response.json(true);
  }));
  const origin = await listen();
  const body = JSON.stringify({ update_id: 10, message: { chat: { id: 123, type: "private" }, from: { id: 123 }, text: `/start ${settings.TELEGRAM_PAIR_CODE}` } });
  const send = () => realFetch(`${origin}/webhook`, { method: "POST", headers: { "x-telegram-bot-api-secret-token": settings.TELEGRAM_WEBHOOK_SECRET }, body });
  expect((await send()).status).toBe(200);
  expect(state).toMatchObject({ chatId: 123, userId: 123, offset: 11 });
  expect((await send()).status).toBe(200);
  expect(telegramCalls).toBe(1);
});
it("lease ocupado devolve conflito e não reconhece atualização como processada", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(null)));
  const origin = await listen();
  const response = await realFetch(`${origin}/webhook`, { method: "POST", headers: { "x-telegram-bot-api-secret-token": settings.TELEGRAM_WEBHOOK_SECRET }, body: "{}" });
  expect(response.status).toBe(409);
});
it("falha de persistência não vira sucesso HTTP", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
  const origin = await listen();
  const response = await realFetch(`${origin}/scan`, { method: "POST", headers: scanHeaders(), body: "{}" });
  expect(response.status).toBe(503);
});
it("só registra conexão Gupy depois de validar a sessão pelo servidor e persistir o estado", async () => {
  const key = "e".repeat(64);
  const sealed = sealGupySession({ authorization: "Bearer fake-gupy-session" }, key);
  let state: unknown = { chatId: 123, userId: 123 }; let revision = 0; let imported = false;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (String(url) === gupyAccountUrl) return Response.json({ id: 42 });
    if (String(url).startsWith("https://api.telegram.org/")) return Response.json({ ok: true, result: true });
    const command = JSON.parse(String(init.body));
    if (command.op === "connect_gupy") { imported = true; return Response.json(true); }
    if (command.op === "acquire") return Response.json({ state, revision, profile: { gupySession: sealed } });
    if (command.op === "save") { state = command.state; return Response.json({ revision: ++revision }); }
    return Response.json(true);
  }));
  const origin = await listen({ GUPY_SESSION_KEY: key });
  const response = await realFetch(`${origin}/gupy/connect`, { method: "POST", headers: { Authorization: `Bearer ${settings.TELEGRAM_STORE_TOKEN}` }, body: JSON.stringify(sealed) });
  expect(response.status).toBe(200);
  expect(imported).toBe(true);
  expect(state).toMatchObject({ gupy: { status: "connected" } });
});
it("sessão rejeitada pela Gupy não substitui a sessão anterior no banco", async () => {
  const key = "e".repeat(64);
  const remote = vi.fn().mockResolvedValue(new Response("{}", { status: 401 })); vi.stubGlobal("fetch", remote);
  const origin = await listen({ GUPY_SESSION_KEY: key });
  const response = await realFetch(`${origin}/gupy/connect`, { method: "POST", headers: { Authorization: `Bearer ${settings.TELEGRAM_STORE_TOKEN}` }, body: JSON.stringify(sealGupySession({ cookie: "session=expired" }, key)) });
  expect(response.status).toBe(401);
  expect(remote).toHaveBeenCalledTimes(1);
  expect(remote).toHaveBeenCalledWith(gupyAccountUrl, expect.anything());
});

it("cadastro usa link único, cookie HttpOnly, CSRF e persistência cifrada; salvar invalida aprovações", async () => {
  const token = "f".repeat(64); const key = "e".repeat(64);
  let state: any = { chatId: 123, userId: 123, flow: { portal: { ticketHash: digest(token), ticketUntil: Date.now() + 60000 } } };
  let revision = 0;
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
    const command = JSON.parse(String(init.body));
    if (command.op === "acquire") return Response.json({ state, revision });
    if (command.op === "save") { state = command.state; return Response.json({ revision: ++revision }); }
    return Response.json(true);
  }));
  const origin = await listen({ GUPY_SESSION_KEY: key });
  const exchange = () => realFetch(`${origin}/private/session`, { method: "POST", headers: { Origin: "https://prumo-telegram.onrender.com" }, body: JSON.stringify({ token }) });
  const response = await exchange(); expect(response.status).toBe(200);
  const cookie = response.headers.get("set-cookie")!;
  expect(cookie).toContain("HttpOnly"); expect(cookie).toContain("SameSite=Strict"); expect(cookie).toContain("Secure");
  expect((await exchange()).status).toBe(401);
  const headers = { Cookie: cookie.split(";")[0], Origin: "https://prumo-telegram.onrender.com" };
  expect((await realFetch(`${origin}/private/profile`)).status).toBe(401);
  expect((await realFetch(`${origin}/private/profile`, { method: "POST", headers: { ...headers, Origin: "https://evil.example" }, body: "{}" })).status).toBe(403);
  const saved = await realFetch(`${origin}/private/profile`, { method: "POST", headers, body: JSON.stringify({ version: 0, candidate: { cpf: "52998224725", motherName: "Informação privada de teste" } }) });
  expect(saved.status).toBe(200); expect(state.flow.version).toBe(1);
  expect(JSON.stringify(state)).not.toContain("52998224725"); expect(JSON.stringify(state)).not.toContain("Informação privada de teste");
  expect(openPrivate(state.flow.vault, key, "candidate")).toMatchObject({ cpf: "52998224725" });
  expect((await realFetch(`${origin}/private/profile`, { headers })).status).toBe(200);
  expect((await realFetch(`${origin}/private/profile`, { method: "POST", headers, body: JSON.stringify({ version: 0, candidate: {} }) })).status).toBe(409);
  expect((await realFetch(`${origin}/private/profile`, { method: "DELETE", headers })).status).toBe(200);
  expect(state.flow.vault).toBeUndefined();
  expect((await realFetch(`${origin}/private/logout`, { method: "POST", headers, body: "{}" })).status).toBe(200);
  expect((await realFetch(`${origin}/private/profile`, { headers })).status).toBe(401);
});
