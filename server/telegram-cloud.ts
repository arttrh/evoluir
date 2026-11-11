import { createServer, type IncomingMessage } from "node:http";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { z } from "zod";
import { TelegramWorker, stateSchema, telegramConfigSchema } from "./telegram.js";
import { readBounded } from "./http.js";
import { openGupySession, sealedGupySchema, verifyGupySession } from "./gupy-session.js";
import { candidateSchema, digest, sealPrivate } from "./candidate-profile.js";
import { ApplicationFlow, type Mailer } from "./application-flow.js";
import { createTransport } from "nodemailer";

// Gmail com senha de app (Conta Google → Segurança → Senhas de app). Sem as duas variáveis, o envio fica desativado.
export function gmailMailer(user: string, password: string, from: string): Mailer {
  const transport = createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass: password },
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000 });
  return {
    async send(message) {
      await transport.sendMail({ from: `${from} <${user}>`, to: message.to, subject: message.subject, text: message.text,
        attachments: [{ filename: "curriculo.pdf", content: message.pdf, contentType: "application/pdf" }] });
    },
  };
}

const settingsSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d{6,}:[A-Za-z0-9_-]{30,}$/),
  TELEGRAM_PAIR_CODE: z.string().regex(/^[a-f0-9]{24,64}$/),
  TELEGRAM_WEBHOOK_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_SCAN_SECRET: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_TOKEN: z.string().regex(/^[a-f0-9]{64}$/),
  TELEGRAM_STORE_URL: z.string().regex(/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/prumo-telegram-store$/),
  GUPY_SESSION_KEY: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  GMAIL_USER: z.email().optional(),
  GMAIL_APP_PASSWORD: z.string().transform(value => value.replace(/\s/g, "")).pipe(z.string().regex(/^[a-z]{16}$/)).optional(),
  PUBLIC_ORIGIN: z.url().refine(value => new URL(value).origin === value && value.startsWith("https://")).default("https://prumo-telegram.onrender.com"),
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

  async function operation(kind: "scan" | "update" | "gupy" | "private", input?: unknown,
    visit?: (bot: TelegramWorker, flow: ApplicationFlow) => Promise<unknown>) {
    const owner = randomUUID();
    const acquired = await store({ op: "acquire", owner });
    if (!acquired) return false;
    let revision = z.number().int().nonnegative().parse(acquired.revision);
    try {
      let flow: ApplicationFlow | undefined;
      const bot = new TelegramWorker(config, "", { state: stateSchema.parse(acquired.state), profile: acquired.profile,
        ...(settings.GUPY_SESSION_KEY ? { flow: (action: string, data?: string) => flow!.command(action, data) } : {}),
        persist: async state => {
          const saved = await store({ op: "save", owner, revision, state });
          revision = z.number().int().positive().parse(saved.revision);
        },
      });
      if (settings.GUPY_SESSION_KEY) {
        const resume = async () => {
          const profile = await store({ op: "profile" });
          const pdf = Buffer.from(z.string().max(4000000).parse(profile.resumeBase64), "base64");
          if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("PDF indisponível.");
          return pdf;
        };
        const created: ApplicationFlow = new ApplicationFlow(bot, settings.GUPY_SESSION_KEY, settings.PUBLIC_ORIGIN, acquired.profile?.gupySession, {
          resume, links: acquired.profile?.links,
          ...(settings.GMAIL_USER && settings.GMAIL_APP_PASSWORD ? { mailer: {
            send: message => gmailMailer(settings.GMAIL_USER!, settings.GMAIL_APP_PASSWORD!, created.candidate().fullName || "Candidato").send(message),
          } } : {}),
        });
        flow = created;
      }
      if (visit) {
        if (!flow || !bot.state.userId) throw new Error("Cadastro indisponível.");
        return { result: await visit(bot, flow) };
      }
      if (kind === "gupy") {
        if (!settings.GUPY_SESSION_KEY || !bot.state.chatId) throw new Error("Conexão não configurada.");
        const connected = await verifyGupySession(acquired.profile?.gupySession, settings.GUPY_SESSION_KEY);
        bot.state.gupy = { status: connected ? "connected" : "expired", verifiedAt: new Date().toISOString() };
        await bot.save();
        if (connected) await bot.message("Conexão com a Gupy confirmada pelo servidor. Sua sessão está cifrada na nuvem; nenhuma senha foi enviada ao chat.\n\nUse /cadastro para dados privados e /candidaturas para revisar cada inscrição. Nenhuma candidatura é enviada sem sua confirmação.");
        return connected;
      } else if (kind === "scan") {
        // O horário por janela evita pular uma rodada por poucos segundos de diferença entre disparos do cron.
        await bot.scan(Math.floor(Date.now() / 1800000) * 1800000);
        if (flow && !bot.state.paused) await flow.sync();
      } else await bot.handleUpdate(input);
      return true;
    } finally { await store({ op: "release", owner }); }
  }

  const server = createServer(async (request: IncomingMessage, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const path = request.url;
    if (path === "/health" && request.method === "GET") { response.end('{"ok":true}'); return; }
    const asset = { "/cadastro": ["candidate.html", "text/html; charset=utf-8"], "/cadastro.js": ["candidate.js", "text/javascript; charset=utf-8"], "/cadastro.css": ["candidate.css", "text/css; charset=utf-8"],
      "/cadastro.woff2": ["../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2", "font/woff2"] }[path || ""];
    if (asset && request.method === "GET") {
      response.setHeader("Content-Type", asset[1]);
      response.end(readFileSync(join(process.cwd(), "telegram", asset[0]))); return;
    }
    if (path?.startsWith("/private/")) {
      const routes = ["/private/session", "/private/profile", "/private/review", "/private/resume", "/private/logout"];
      if (!routes.includes(path) || !["GET", "POST", "DELETE"].includes(request.method || "")) { response.writeHead(404).end("{}"); return; }
      if (request.method !== "GET" && request.headers.origin !== settings.PUBLIC_ORIGIN
          || request.headers.origin && request.headers.origin !== settings.PUBLIC_ORIGIN) { response.writeHead(403).end("{}"); return; }
      const session = /(?:^|;\s*)__Host-evoluir_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || "")?.[1];
      if (path !== "/private/session" && !session) { response.writeHead(401).end("{}"); return; }
      let cookie: string | undefined;
      try {
        const input = request.method === "POST" ? await incomingJson(request, 24000) : undefined;
        const result = await operation("private", undefined, async (bot, flow) => {
          const state = bot.state.flow;
          const portal = state.portal;
          if (path === "/private/session" && request.method === "POST") {
            const token = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).parse(input).token;
            if (!portal || portal.ticketUntil < Date.now() || !authorized(digest(token), portal.ticketHash)) return { unauthorized: true };
            const next = randomBytes(32).toString("hex");
            portal.ticketHash = ""; portal.ticketUntil = 0;
            portal.sessionHash = digest(next); portal.sessionUntil = Date.now() + 30 * 60000;
            await bot.save();
            cookie = `__Host-evoluir_session=${next}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800`;
            return { ok: true };
          }
          if (!portal?.sessionHash || !session || !portal.sessionUntil || portal.sessionUntil < Date.now() || !authorized(digest(session), portal.sessionHash)) return { unauthorized: true };
          if (path === "/private/logout" && request.method === "POST") {
            state.portal = undefined; await bot.save();
            cookie = "__Host-evoluir_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
            return { ok: true };
          }
          if (path === "/private/resume" && request.method === "GET") {
            const profile = await store({ op: "profile" });
            const pdf = Buffer.from(z.string().max(4000000).parse(profile.resumeBase64), "base64");
            if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("PDF indisponível.");
            return { pdf };
          }
          if (path === "/private/profile") {
            if (request.method === "POST" || request.method === "DELETE") {
              if (request.method === "POST") {
                const body = z.object({ version: z.number().int(), candidate: candidateSchema }).strict().parse(input);
                if (body.version !== state.version) return { conflict: true };
                state.vault = sealPrivate(body.candidate, settings.GUPY_SESSION_KEY!, "candidate");
              } else state.vault = undefined;
              state.version++;
              for (const app of Object.values(state.applications)) {
                app.snapshot = undefined; app.reviewedHash = undefined; app.snapshotHash = undefined;
                if (app.status === "review") app.status = app.applicationId ? "pending" : "cancelled";
              }
              await bot.save();
              return { ok: true, version: state.version };
            }
            const drafts = Object.entries(state.applications).filter(([, app]) => app.status === "review" && app.snapshot && app.expiresAt > Date.now() && app.profileVersion === state.version)
              .map(([id, app]) => ({ id, title: bot.state.entries[id].vacancy.title, hash: app.snapshotHash, ...flow.draft(id) }));
            return { candidate: flow.candidate(), version: state.version, drafts,
              applications: Object.entries(state.applications).map(([id, app]) => ({ id, title: bot.state.entries[id].vacancy.title,
                status: flow.status(id), tasks: app.tasks, checkedAt: app.checkedAt, url: flow.applicationUrl(id) })) };
          }
          if (path === "/private/review" && request.method === "POST") {
            const body = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/), hash: z.string().regex(/^[a-f0-9]{64}$/), acknowledged: z.literal(true) }).strict().parse(input);
            await flow.reviewed(body.id, body.hash);
            return { ok: true };
          }
          return { invalid: true };
        });
        if (result === false) { response.writeHead(409).end('{"error":"Outra operação está em andamento. Tente novamente."}'); return; }
        if (typeof result !== "object") throw new Error("Resposta indisponível.");
        const payload = result.result as { unauthorized?: boolean; conflict?: boolean; invalid?: boolean; pdf?: Buffer };
        if (payload.unauthorized) { response.writeHead(401).end('{"error":"Abra um novo link pelo comando /cadastro no Telegram."}'); return; }
        if (payload.conflict) { response.writeHead(409).end('{"error":"O cadastro mudou. Recarregue antes de salvar."}'); return; }
        if (payload.invalid) { response.writeHead(405).end("{}"); return; }
        if (cookie) response.setHeader("Set-Cookie", cookie);
        if (payload.pdf) {
          response.setHeader("Content-Type", "application/pdf");
          response.setHeader("Content-Disposition", 'attachment; filename="curriculo-evoluir.pdf"'); response.end(payload.pdf); return;
        }
        response.end(JSON.stringify(payload));
      } catch {
        response.writeHead(422).end('{"error":"Não foi possível confirmar. Confira os campos ou gere uma nova revisão pelo Telegram. Recarregue antes de tentar novamente."}');
      }
      return;
    }
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
