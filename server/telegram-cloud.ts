import { createServer, type IncomingMessage } from "node:http";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, timingSafeEqual, createHmac } from "node:crypto";
import { z } from "zod";
import { TelegramWorker, stateSchema, telegramConfigSchema } from "./telegram.js";
import { readBounded } from "./http.js";
import { openGupySession, sealedGupySchema, verifyGupySession } from "./gupy-session.js";

const settingsSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d{6,}:[A-Za-z0-9_-]{30,}$/),
  TELEGRAM_PAIR_CODE: z.string().regex(/^[a-f0-9]{24,64}$/),
  TELEGRAM_WEBHOOK_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_SCAN_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_TOKEN: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_URL: z.string().regex(/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/prumo-telegram-store$/),
  GUPY_SESSION_KEY: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  PORT: z.coerce.number().int().min(0).max(65535).default(10000),
});

export function authorized(supplied: unknown, expected: string) {
  if (typeof supplied !== "string") return false;
  const a = Buffer.from(supplied); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authorizedScan(timestamp: unknown, signature: unknown, key: string, now = Date.now()) {
  if (typeof timestamp !== "string" || !/^\d{10,}$/.test(timestamp)) return false;
  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds) || Math.abs(now / 1000 - seconds) > 300) return false;
  return authorized(signature, createHmac("sha256", key).update(`scan:${timestamp}`).digest("hex"));
}

export async function incomingJson(request: AsyncIterable<Uint8Array>, maximum = 65536) {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximum) throw new Error("Requisição muito grande.");
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function startTelegramWeb(environment: NodeJS.ProcessEnv) {
  const settings = settingsSchema.parse(environment);
  const folder = mkdtempSync(join(tmpdir(), "prumo-telegram-"));
  const tokenFile = join(folder, "token");
  writeFileSync(tokenFile, settings.TELEGRAM_BOT_TOKEN, { mode: 0o600 });
  const config = telegramConfigSchema.parse({ tokenFile, botUsername: "artthrbot", pairCode: settings.TELEGRAM_PAIR_CODE, intervalMinutes: 30 });

  async function store(command: Record<string, unknown>) {
    const response = await fetch(settings.TELEGRAM_STORE_URL, {
      method: "POST", headers: { Authorization: `Bearer ${settings.TELEGRAM_STORE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command), redirect: "error", signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Persistência indisponível.", { cause: `store_http_${response.status}` });
    return JSON.parse(await readBounded(response, 4_000_000));
  }

  async function operation(kind: "scan" | "update" | "gupy", input?: unknown) {
    const owner = randomUUID();
    const acquired = await store({ op: "acquire", owner });
    if (!acquired) return false;
    let revision = z.number().int().nonnegative().parse(acquired.revision);
    try {
      const bot = new TelegramWorker(config, "", { state: stateSchema.parse(acquired.state), profile: acquired.profile,
        persist: async state => {
          const saved = await store({ op: "save", owner, revision, state });
          revision = z.number().int().positive().parse(saved.revision);
        },
      });
      if (kind === "gupy") {
        if (!settings.GUPY_SESSION_KEY || !bot.state.chatId) throw new Error("Conexão não configurada.");
        const connected = await verifyGupySession(acquired.profile?.gupySession, settings.GUPY_SESSION_KEY);
        bot.state.gupy = { status: connected ? "connected" : "expired", verifiedAt: new Date().toISOString() };
        await bot.save();
        if (connected) await bot.message("Conexão com a Gupy confirmada pelo servidor. Sua sessão está cifrada na nuvem; nenhuma senha foi enviada ao chat.\n\nO envio de candidaturas ainda não está habilitado. Use /gupy para consultar a conexão.");
        return connected;
      } else if (kind === "scan") {
        // O horário por janela evita pular uma rodada por poucos segundos de diferença entre disparos do cron.
        await bot.scan(Math.floor(Date.now() / 1800000) * 1800000);
      } else await bot.handleUpdate(input);
      return true;
    } finally { await store({ op: "release", owner }); }
  }

  const server = createServer(async (request: IncomingMessage, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    const path = request.url;
    if (path === "/health" && request.method === "GET") { response.end('{"ok":true}'); return; }
    const webhook = path === "/webhook" && request.method === "POST";
    const scan = path === "/scan" && request.method === "POST";
    const gupy = path === "/gupy/connect" && request.method === "POST";
    if (!webhook && !scan && !gupy) { response.writeHead(404).end("{}"); return; }
    const allowed = webhook
      ? authorized(request.headers["x-telegram-bot-api-secret-token"], settings.TELEGRAM_WEBHOOK_SECRET)
      : gupy ? authorized(request.headers.authorization, `Bearer ${settings.TELEGRAM_STORE_TOKEN}`)
        : authorizedScan(request.headers["x-prumo-timestamp"], request.headers["x-prumo-signature"], settings.TELEGRAM_SCAN_SECRET);
    if (!allowed) { response.writeHead(401).end("{}"); return; }
    let stage = "read_request";
    try {
      const input = await incomingJson(request);
      if (gupy) {
        stage = "decrypt_gupy_session";
        if (!settings.GUPY_SESSION_KEY) throw new Error("Conexão não configurada.");
        const sealed = sealedGupySchema.parse(input);
        openGupySession(sealed, settings.GUPY_SESSION_KEY);
        stage = "verify_gupy_account";
        if (!await verifyGupySession(sealed, settings.GUPY_SESSION_KEY)) {
          response.writeHead(401).end('{"error":"gupy_session_invalid"}'); return;
        }
        stage = "persist_gupy_session";
        await store({ op: "connect_gupy", session: sealed });
      }
      stage = "process_operation";
      const completed = await operation(gupy ? "gupy" : webhook ? "update" : "scan", input);
      if (!completed) { response.writeHead(409).end('{"error":"Operação em andamento."}'); return; }
      response.end('{"ok":true}');
    } catch (error) {
      const cause = error instanceof Error ? error.cause : undefined;
      const code = typeof cause === "string" && /^(gupy_http_\d+|gupy_unexpected_shape|store_http_\d+)$/.test(cause) ? cause : "details_omitted";
      console.error(`Operação não confirmada: ${stage}, ${code}. Dados e segredos omitidos.`);
      response.writeHead(503).end('{"error":"Operação não confirmada."}');
    }
  });
  server.requestTimeout = 120000;
  server.headersTimeout = 10000;
  server.on("close", () => rmSync(folder, { recursive: true, force: true }));
  server.listen(settings.PORT, "0.0.0.0", () => console.log("Bot HTTP pronto; histórico persistido fora do contêiner."));
  return server;
}
