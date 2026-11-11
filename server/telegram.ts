import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { searchJobs } from "./job-search.js";
import { readBounded } from "./http.js";
import { vacancySchema, type Vacancy } from "../src/jobs.js";
import { gupyVacancySchema, searchGupyJobs, type GupyVacancy } from "./gupy-jobs.js";
import { flowSchema } from "./candidate-profile.js";

export const telegramConfigSchema = z.object({
  tokenFile: z.string().min(1),
  botUsername: z.string().regex(/^[a-zA-Z0-9_]+bot$/i),
  pairCode: z.string().regex(/^[a-f0-9]{24,64}$/),
  intervalMinutes: z.number().int().min(30).max(1440),
  location: z.string().max(60).default(""),
});
const entrySchema = z.object({
  vacancy: z.union([vacancySchema, gupyVacancySchema]),
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
  gupy: z.object({ status: z.enum(["connected", "expired"]), verifiedAt: z.string().datetime() }).optional(),
  flow: flowSchema.prefault({}),
  // Contadores do dia (horário de Brasília) para o resumo diário: deixam claro que o bot está ativo mesmo sem vagas novas.
  daily: z.object({ day: z.string(), scans: z.number().int().nonnegative(), found: z.number().int().nonnegative(),
    sent: z.number().int().nonnegative(), errors: z.number().int().nonnegative(), reportedDay: z.string().default("") }).optional(),
});
export const summaryHour = 21;
export function brasiliaDay(now: number) {
  const local = new Date(now - 3 * 3600000);
  return { day: local.toISOString().slice(0, 10), hour: local.getUTCHours() };
}
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
export function recruiterEmails(text: string) {
  return [...new Set((text.match(emailPattern) || []).map(email => email.toLowerCase().replace(/\.$/, "")))]
    .filter(email => !/^(no-?reply|nao-?responda|donotreply)@/.test(email) && !/@(gupy\.io|example\.com)$/.test(email)).slice(0, 3);
}
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
type CandidateProfile = { resumeSource: string; links: { github: string; linkedin: string; portfolio: string }; applicationSources?: string[] };
type CloudState = { state: unknown; persist: (state: z.infer<typeof stateSchema>) => Promise<void>; profile?: CandidateProfile;
  flow?: (action: string, data?: string) => Promise<string | void> };

export function matchesJavaEntry(vacancy: Pick<Vacancy, "title" | "description" | "labels">) {
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
    const start = new RegExp(`^/start(?:@${this.config.botUsername})?(?:\\s+(\\S+))?\\s*$`, "i").exec(message?.text || "");
    if (!this.state.chatId && message?.chat.type === "private" && message.from
        && message.chat.id === message.from.id && start?.[1] === this.config.pairCode) {
      this.state.chatId = message.chat.id;
      this.state.userId = message.from.id;
      await this.save();
      await this.message(this.cloud
        ? "Conta vinculada ao Evoluir.\n\nJava júnior e estágio. Busca pública da Gupy a cada 30 minutos; LinkedIn ainda não conectado.\n\nUse /cadastro para dados privados, /candidaturas para revisar por vaga e /pendencias para testes. Nenhuma candidatura é enviada sem sua confirmação."
        : "Conectado ao Evoluir. Use /status, /perfil e /pausar. Nenhuma candidatura foi enviada.");
      console.log("Conversa privada vinculada.");
    } else if (start && message?.chat.type === "private" && message.from
        && message.chat.id === message.from.id && message.from.id !== this.state.userId) {
      await this.api("sendMessage", { chat_id: message.chat.id,
        text: "Olá! O bot está online. Para acessar seu perfil, abra o link privado de vinculação recebido na conversa em que você configurou o bot e toque em Iniciar. O /start sozinho não autoriza acesso ao currículo. Não envie senhas aqui." });
    } else if (message?.chat.type === "private" && message.chat.id === this.state.chatId
        && message.from?.id === this.state.userId) {
      if (message.text === "/buscar") {
        const result = await this.scan(Date.now(), true);
        await this.message(result
          ? `Busca feita agora: ${result.found} vagas compatíveis na Gupy, ${result.sent} novas avisadas.${result.sent ? "" : " Nada novo desde o último aviso."}`
          : "Busca indisponível: confirme que a conta está vinculada e os avisos não estão pausados (/retomar).");
      }
      else if (message.text === "/pausar") { this.state.paused = true; await this.save(); await this.message("Avisos pausados. Use /retomar para continuar."); }
      else if (message.text === "/retomar") {
        if (this.cloud && !this.cloud.profile?.applicationSources?.includes("Gupy")) await this.message("Nenhuma fonte de vagas conectada. Fontes antigas continuam suspensas.");
        else { this.state.paused = false; await this.save(); await this.message(this.cloud ? "Avisos da busca pública da Gupy retomados. Use /candidaturas para revisar inscrições; LinkedIn ainda não conectado." : "Avisos retomados."); }
      }
      else if (message.text === "/perfil" && this.cloud?.profile) {
        const profile = this.cloud.profile;
        await this.message(`Currículo Evoluir: ${profile.resumeSource.split("/").pop()}\n\nLinkedIn: ${profile.links.linkedin}\nGitHub: ${profile.links.github}\nPortfólio: ${profile.links.portfolio}\n\nUse /cadastro para documentos e salários; /candidaturas para revisar cada vaga. A Gupy usa o currículo cadastrado nela; o PDF acima não o substitui automaticamente.`);
      }
      else if (/^\/email(?:\s|$)/.test(message.text || "") && this.cloud?.flow) {
        try { await this.cloud.flow("email", message.text!.slice(6).trim()); }
        catch { await this.message("Não foi possível preparar o e-mail. Use: /email recrutador@empresa.com Título da vaga"); }
      }
      else if (["/cadastro", "/candidaturas", "/pendencias", "/sincronizar"].includes(message.text || "") && this.cloud?.flow) {
        try { await this.cloud.flow(message.text!.slice(1)); }
        catch { await this.message("Não foi possível preparar esta ação. Dados preservados. Confira /gupy e tente novamente."); }
      }
      else if (message.text === "/gupy") {
        await this.message(this.state.gupy?.status === "connected"
          ? `Sessão da Gupy confirmada em ${new Date(this.state.gupy.verifiedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.\n\nUse /candidaturas para revisar uma inscrição. Cada início e conclusão exige sua confirmação; testes são respondidos por você.`
          : "Para conectar sua conta, use o computador uma vez: abra o menu de aplicativos e procure Conectar Gupy ao Evoluir. Entre na janela oficial da Gupy e aguarde a confirmação aqui. Não envie senha ou código por mensagem.\n\nA sessão será guardada cifrada na nuvem. Se ela expirar, repita esse processo. Abrir apenas o site da Gupy no celular não conecta o bot.");
      }
      else if (message.text === "/status" || message.text?.startsWith("/start")) {
        await this.message(this.cloud
          ? `Java júnior e estágio · Gupy pública · ${this.state.paused ? "avisos pausados" : "busca a cada 30 minutos, resumo diário às 21h"}.\nÚltima busca: ${this.state.lastSearch ? new Date(this.state.lastSearch).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "aguardando"}.\nHoje: ${this.state.daily?.day === brasiliaDay(Date.now()).day ? `${this.state.daily.scans} buscas, ${this.state.daily.sent} vagas novas` : "nenhuma busca ainda"}.\n\n/buscar: procurar vagas agora\n/candidaturas: vagas selecionadas e candidatura em 1 toque\n/email: enviar currículo por e-mail\n/cadastro: documentos e salários em privado\n/pendencias: testes e próximas etapas\n/gupy: sessão da conta\n\nLinkedIn ainda não conectado.`
          : `Java júnior e estágio · a cada ${this.config.intervalMinutes} minutos · ${this.state.paused ? "pausado" : "ativo"}.\nÚltima busca: ${this.state.lastSearch ? new Date(this.state.lastSearch).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "aguardando"}.\nVagas selecionadas: ${Object.values(this.state.entries).filter(e => e.status === "interesse").length}.\nEnvio de currículo ainda não configurado.`);
      }
    }
    const callback = update.callback_query;
    if (callback) {
      let text = "Ação não autorizada ou vaga indisponível.";
      const match = /^(interesse|ignorada):([a-f0-9]{24})$/.exec(callback.data || "");
      const flow = /^(preparar|candidatar|cancelar|aprovar|email|enviar|descartar):([a-f0-9]{24}(?::[a-f0-9]{16})?)$/.exec(callback.data || "");
      const owner = callback.from.id === this.state.userId && callback.message?.chat.type === "private"
        && callback.message.chat.id === this.state.chatId;
      if (owner && flow && this.cloud?.flow) {
        try { text = await this.cloud.flow(flow[1], flow[2]) || "Ação concluída."; }
        catch { text = "Ação não confirmada. Confira /gupy e prepare novamente em /candidaturas."; }
      } else if (owner && match && this.state.entries[match[2]]
          && (!this.cloud || this.state.entries[match[2]].vacancy.source === "Gupy")) {
        this.state.entries[match[2]].status = match[1] as "interesse" | "ignorada";
        const application = this.state.flow.applications[match[2]];
        if (match[1] === "ignorada" && application && ["review", "pending"].includes(application.status)) {
          application.status = "cancelled"; application.snapshot = undefined; application.reviewedHash = undefined;
        }
        await this.save();
        text = match[1] === "interesse" ? "Interesse salvo. Nenhum currículo foi enviado." : "Vaga ignorada.";
        if (match[1] === "interesse" && this.cloud?.flow) await this.message("Interesse salvo. Use /candidaturas para preparar e revisar a inscrição. Selecionar interesse não autoriza envio.");
      }
      try { await this.api("answerCallbackQuery", { callback_query_id: callback.id, text, show_alert: true }); }
      catch { console.error("Resposta visual do botão indisponível; seleção já processada não será repetida."); }
    }
    this.state.offset = update.update_id + 1;
    await this.save();
  }

  daily(now: number) {
    const { day } = brasiliaDay(now);
    if (this.state.daily?.day !== day) this.state.daily = { day, scans: 0, found: 0, sent: 0, errors: 0, reportedDay: this.state.daily?.reportedDay || "" };
    return this.state.daily;
  }

  async summary(now: number) {
    const { day, hour } = brasiliaDay(now);
    const daily = this.daily(now);
    if (!this.cloud || hour < summaryHour || daily.reportedDay === day) return;
    daily.reportedDay = day;
    await this.save();
    const pending = Object.values(this.state.entries).filter(e => e.status === "interesse").length;
    await this.message(`Resumo de hoje (${day.split("-").reverse().join("/")})\n\n${daily.scans} buscas na Gupy · ${daily.found} vagas Java júnior/estágio abertas · ${daily.sent} novas avisadas hoje${daily.errors ? ` · ${daily.errors} buscas com falha da Gupy` : ""}.\n${daily.sent ? "" : "Nenhuma vaga nova hoje; o bot continua buscando a cada 30 minutos.\n"}${pending ? `\n${pending} vaga(s) marcadas com interesse. Use /candidaturas para se candidatar em 1 toque.` : ""}`);
  }

  async scan(now = Date.now(), force = false) {
    if (!this.state.chatId || this.state.paused || !force && now - this.state.lastSearch < this.config.intervalMinutes * 60000) return;
    const vacancies = new Map<string, Vacancy | GupyVacancy>();
    if (this.cloud) {
      if (!this.cloud.profile?.applicationSources?.includes("Gupy")) return;
      let found;
      try { found = await searchGupyJobs(); }
      catch (error) { this.daily(now).errors++; await this.save(); throw error; }
      for (const vacancy of found) if (matchesJavaEntry(vacancy)) vacancies.set(vacancy.url, vacancy);
    } else {
      // As variantes evitam combinar júnior e estágio como requisitos simultâneos.
      for (const q of ["Java junior", "Java júnior", "Java estágio", "Java estagiário"]) {
        const result = await searchJobs({ q, location: this.config.location, source: "Todas" });
        for (const vacancy of result.items) if (matchesJavaEntry(vacancy)) vacancies.set(vacancy.url, vacancy);
      }
    }
    let sent = 0;
    for (const vacancy of vacancies.values()) {
      const id = createHash("sha256").update(vacancy.url).digest("hex").slice(0, 24);
      if (this.state.entries[id]) continue;
      if (sent === 10) break;
      // shortcut: entrega incerta não é reenviada automaticamente, revisar o estado se houver falha de rede.
      this.state.entries[id] = { vacancy, status: "notificando", at: new Date().toISOString() };
      await this.save();
      const emails = recruiterEmails(vacancy.description);
      const oneTap = this.cloud?.flow && vacancy.source === "Gupy";
      await this.message(`Nova vaga de Java\n\n${vacancy.title}\n${vacancy.source} · ${vacancy.publishedAt.slice(0, 10)}\n${vacancy.labels.join(" · ")}\n\n${vacancy.description.slice(0, 2200)}\n\n${oneTap ? "Candidatar mostra um resumo antes; nada é enviado sem sua confirmação." : "Confira os requisitos no anúncio. Selecionar não envia currículo."}`, {
        inline_keyboard: [[{ text: "Ver anúncio", url: vacancy.url }],
          oneTap ? [{ text: "Candidatar na Gupy", callback_data: `candidatar:${id}` }, { text: "Ignorar", callback_data: `ignorada:${id}` }]
            : [{ text: "Tenho interesse", callback_data: `interesse:${id}` }, { text: "Ignorar", callback_data: `ignorada:${id}` }],
          ...(this.cloud?.flow && emails.length ? [[{ text: `Enviar currículo para ${emails[0]}`, callback_data: `email:${id}` }]] : [])],
      });
      this.state.entries[id].status = "notificada";
      await this.save();
      sent++;
      await delay(1100);
    }
    if (!force) this.state.lastSearch = now;
    const daily = this.daily(now);
    daily.scans++; daily.found = vacancies.size; daily.sent += sent;
    await this.save();
    console.log(`Busca concluída: ${vacancies.size} vagas compatíveis, ${sent} avisos novos.`);
    await this.summary(now);
    return { found: vacancies.size, sent };
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
