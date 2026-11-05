import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { searchJobs } from "./job-search.js";
import { readBounded } from "./http.js";
import { vacancySchema, type Vacancy } from "../src/jobs.js";

export const telegramConfigSchema = z.object({
  tokenFile: z.string().min(1),
  botUsername: z.string().regex(/^[a-zA-Z0-9_]+bot$/i),
  pairCode: z.string().regex(/^[a-f0-9]{24,64}$/),
  intervalMinutes: z.number().int().min(30).max(1440),
  location: z.string().max(60).default(""),
});
const entrySchema = z.object({
  vacancy: vacancySchema,
  status: z.enum(["notificando", "notificada", "interesse", "ignorada"]),
  at: z.string().datetime(),
});
export const stateSchema = z.object({
  offset: z.number().int().nonnegative().default(0),
  chatId: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  paused: z.boolean().default(false),
  lastSearch: z.number().nonnegative().default(0),
  entries: z.record(z.string(), entrySchema).default({}),
});
const userSchema = z.object({ id: z.number().int().positive() });
const messageSchema = z.object({
  chat: z.object({ id: z.number().int(), type: z.string() }),
  from: userSchema.optional(),
  text: z.string().optional(),
});
const updateSchema = z.object({
  update_id: z.number().int().nonnegative(),
  message: messageSchema.optional(),
  callback_query: z.object({
    id: z.string(), from: userSchema, message: messageSchema.optional(), data: z.string().optional(),
  }).optional(),
});
type Config = z.infer<typeof telegramConfigSchema>;
type CandidateProfile = { resumeSource: string; links: { github: string; linkedin: string; portfolio: string } };
type CloudState = { state: unknown; persist: (state: z.infer<typeof stateSchema>) => Promise<void>; profile?: CandidateProfile };

export function matchesJavaEntry(vacancy: Vacancy) {
  const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const role = normalize([vacancy.title, ...vacancy.labels].join(" "));
  return /\bjava\b/.test(normalize(`${vacancy.title} ${vacancy.description}`))
    && /\b(junior|jr|estagio|estagiari[oa]s?|intern|internship)\b/.test(role);
}

export class TelegramWorker {
  state: z.infer<typeof stateSchema>;
  constructor(readonly config: Config, readonly stateFile: string, readonly cloud?: CloudState) {
    if (cloud) { this.state = stateSchema.parse(cloud.state); return; }
    try { this.state = stateSchema.parse(JSON.parse(readFileSync(stateFile, "utf8"))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Estado Telegram inválido; arquivo preservado.");
      this.state = stateSchema.parse({});
    }
  }

  async save() {
    if (this.cloud) return this.cloud.persist(this.state);
    mkdirSync(dirname(this.stateFile), { recursive: true, mode: 0o700 });
    const temporary = `${this.stateFile}.tmp`;
    writeFileSync(temporary, JSON.stringify(this.state), { mode: 0o600 });
    renameSync(temporary, this.stateFile);
  }

  async api(method: string, body: Record<string, unknown> = {}): Promise<unknown> {
    const token = readFileSync(this.config.tokenFile, "utf8").trim();
    if (!/^\d{6,}:[A-Za-z0-9_-]{30,}$/.test(token)) throw new Error("Token Telegram inválido.");
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        signal: AbortSignal.timeout(40000), redirect: "error",
      });
      const data = z.object({ ok: z.boolean(), result: z.unknown().optional() })
        .parse(JSON.parse(await readBounded(response)));
      if (!response.ok || !data.ok) throw new Error();
      return data.result;
    } catch { throw new Error(`Falha Telegram em ${method}; detalhes omitidos para proteger o token.`); }
  }

  async message(text: string, reply_markup?: unknown) {
    return this.api("sendMessage", { chat_id: this.state.chatId, text, reply_markup,
      link_preview_options: { is_disabled: true } });
  }

  async handleUpdate(input: unknown) {
    const update = updateSchema.parse(input);
    if (update.update_id < this.state.offset) return;
    const message = update.message;
    if (!this.state.chatId && message?.chat.type === "private" && message.from
        && message.chat.id === message.from.id && message.text === `/start ${this.config.pairCode}`) {
      this.state.chatId = message.chat.id;
      this.state.userId = message.from.id;
      await this.save();
      await this.message("Conectado ao Evoluir! Vou buscar Java júnior e estágio a cada 30 minutos, sem filtro de localização. Só aviso vagas novas.\n\nUse /status, /perfil, /pausar ou /retomar. O botão Tenho interesse salva sua seleção; ainda não envia currículo.");
      console.log("Conversa privada vinculada.");
    } else if (message?.chat.type === "private" && message.chat.id === this.state.chatId
        && message.from?.id === this.state.userId) {
      if (message.text === "/pausar") { this.state.paused = true; await this.save(); await this.message("Avisos pausados. Use /retomar para continuar."); }
      else if (message.text === "/retomar") { this.state.paused = false; await this.save(); await this.message("Avisos retomados."); }
      else if (message.text === "/perfil" && this.cloud?.profile) {
        const profile = this.cloud.profile;
        await this.message(`Currículo: ${profile.resumeSource.split("/").pop()}\n\nLinkedIn: ${profile.links.linkedin}\nGitHub: ${profile.links.github}\nPortfólio: ${profile.links.portfolio}\n\nCanal de envio ainda não conectado. Nenhuma candidatura foi enviada.`);
      }
      else if (message.text === "/status" || message.text?.startsWith("/start")) {
        await this.message(`Java júnior e estágio · a cada ${this.config.intervalMinutes} minutos · ${this.state.paused ? "pausado" : "ativo"}.\nÚltima busca: ${this.state.lastSearch ? new Date(this.state.lastSearch).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "aguardando"}.\nVagas selecionadas: ${Object.values(this.state.entries).filter(e => e.status === "interesse").length}.\nEnvio de currículo ainda não configurado.`);
      }
    }
    const callback = update.callback_query;
    if (callback) {
      let text = "Ação não autorizada ou vaga indisponível.";
      const match = /^(interesse|ignorada):([a-f0-9]{24})$/.exec(callback.data || "");
      if (callback.from.id === this.state.userId && callback.message?.chat.type === "private"
          && callback.message.chat.id === this.state.chatId && match && this.state.entries[match[2]]) {
        this.state.entries[match[2]].status = match[1] as "interesse" | "ignorada";
        await this.save();
        text = match[1] === "interesse" ? "Interesse salvo. Nenhum currículo foi enviado." : "Vaga ignorada.";
      }
      try { await this.api("answerCallbackQuery", { callback_query_id: callback.id, text, show_alert: true }); }
      catch { console.error("Resposta visual do botão indisponível; seleção já processada não será repetida."); }
    }
    this.state.offset = update.update_id + 1;
    await this.save();
  }

  async scan(now = Date.now()) {
    if (!this.state.chatId || this.state.paused || now - this.state.lastSearch < this.config.intervalMinutes * 60000) return;
    const vacancies = new Map<string, Vacancy>();
    // As variantes evitam combinar júnior e estágio como requisitos simultâneos.
    for (const q of ["Java junior", "Java júnior", "Java estágio", "Java estagiário"]) {
      const result = await searchJobs({ q, location: this.config.location, source: "Todas" });
      for (const vacancy of result.items) if (matchesJavaEntry(vacancy)) vacancies.set(vacancy.url, vacancy);
    }
    let sent = 0;
    for (const vacancy of vacancies.values()) {
      const id = createHash("sha256").update(vacancy.url).digest("hex").slice(0, 24);
      if (this.state.entries[id]) continue;
      if (sent === 10) break;
      // shortcut: entrega incerta não é reenviada automaticamente, revisar o estado se houver falha de rede.
      this.state.entries[id] = { vacancy, status: "notificando", at: new Date().toISOString() };
      await this.save();
      await this.message(`Nova vaga de Java\n\n${vacancy.title}\n${vacancy.source} · ${vacancy.publishedAt.slice(0, 10)}\n${vacancy.labels.join(" · ")}\n\n${vacancy.description.slice(0, 2200)}\n\nConfira os requisitos no anúncio. Selecionar não envia currículo.`, {
        inline_keyboard: [[{ text: "Ver anúncio", url: vacancy.url }],
          [{ text: "Tenho interesse", callback_data: `interesse:${id}` }, { text: "Ignorar", callback_data: `ignorada:${id}` }]],
      });
      this.state.entries[id].status = "notificada";
      await this.save();
      sent++;
      await delay(1100);
    }
    this.state.lastSearch = now;
    await this.save();
    console.log(`Busca concluída: ${vacancies.size} vagas compatíveis, ${sent} avisos novos.`);
  }

  async run() {
    const me = z.object({ username: z.string() }).parse(await this.api("getMe"));
    if (me.username.toLowerCase() !== this.config.botUsername.toLowerCase()) throw new Error("O token pertence a outro bot.");
    const webhook = z.object({ url: z.string() }).parse(await this.api("getWebhookInfo"));
    if (webhook.url) throw new Error("Este bot já tem webhook. Configuração existente preservada.");
    console.log("Telegram conectado. Aguardando mensagens da conversa vinculada.");
    while (true) {
      const updates = z.array(z.unknown()).parse(await this.api("getUpdates", {
        offset: this.state.offset, timeout: 25, allowed_updates: ["message", "callback_query"],
      }));
      for (const update of updates) await this.handleUpdate(update);
      await this.scan();
    }
  }
}
