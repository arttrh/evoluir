import { createServer, type IncomingMessage } from "node:http";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { TelegramWorker, stateSchema, telegramConfigSchema } from "./telegram.js";
import { readBounded } from "./http.js";

const settingsSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d{6,}:[A-Za-z0-9_-]{30,}$/),
  TELEGRAM_PAIR_CODE: z.string().regex(/^[a-f0-9]{24,64}$/),
  TELEGRAM_WEBHOOK_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_SCAN_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_TOKEN: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_URL: z.string().regex(/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/prumo-telegram-store$/),
  PORT: z.coerce.number().int().min(0).max(65535).default(10000),
});

export function authorized(supplied: unknown, expected: string) {
  if (typeof supplied !== "string") return false;
  const a = Buffer.from(supplied); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
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
    if (!response.ok) throw new Error("Persistência indisponível.");
    return JSON.parse(await readBounded(response, 4_000_000));
  }

  async function operation(kind: "scan" | "update", input?: unknown) {
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
      if (kind === "scan") {
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
    if (!webhook && !scan) { response.writeHead(404).end("{}"); return; }
    const allowed = webhook
      ? authorized(request.headers["x-telegram-bot-api-secret-token"], settings.TELEGRAM_WEBHOOK_SECRET)
      : authorized(request.headers.authorization, `Bearer ${settings.TELEGRAM_SCAN_SECRET}`);
    if (!allowed) { response.writeHead(401).end("{}"); return; }
    try {
      const input = await incomingJson(request);
      const completed = await operation(webhook ? "update" : "scan", input);
      if (!completed) { response.writeHead(409).end('{"error":"Operação em andamento."}'); return; }
      response.end('{"ok":true}');
      if (webhook) void operation("scan").catch(() => console.error("Busca após mensagem falhou; nova tentativa no agendamento."));
    } catch {
      console.error("Operação Telegram não confirmada; dados e segredos omitidos.");
      response.writeHead(503).end('{"error":"Operação não confirmada."}');
    }
  });
  server.requestTimeout = 120000;
  server.headersTimeout = 10000;
  server.on("close", () => rmSync(folder, { recursive: true, force: true }));
  server.listen(settings.PORT, "0.0.0.0", () => console.log("Bot HTTP pronto; histórico persistido fora do contêiner."));
  return server;
}
