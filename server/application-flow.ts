import { randomBytes } from "node:crypto";
import { z } from "zod";
import { recruiterEmails, type TelegramWorker } from "./telegram.js";
import { candidateSchema, digest, maskedCandidate, openPrivate, sealPrivate, type Candidate } from "./candidate-profile.js";
import { GupyApplications, GupyRequestError, gupyTarget } from "./gupy-applications.js";

const draftSchema = z.object({
  phase: z.enum(["start", "complete"]),
  preview: z.object({ job: z.record(z.string(), z.unknown()), curriculum: z.unknown(), fields: z.unknown() }),
  additional: z.record(z.string(), z.unknown()).optional(),
  registration: z.unknown().optional(), missing: z.array(z.string()).default([]),
});
export type ApplicationDraft = z.infer<typeof draftSchema>;

export function additionalPlan(profile: Candidate, title: string, fields: unknown, registration: { schema: unknown; additional: Record<string, unknown> }) {
  const plan = { ...registration.additional };
  const missing: string[] = [];
  const salary = /est[aá]gi|intern/i.test(title) ? profile.salaryIntern : profile.salaryJunior;
  const requested = z.object({ fields: z.array(z.object({ slug: z.string(), isRequired: z.boolean().optional() })) }).parse(fields).fields;
  if (requested.some(field => field.slug === "salary_expectation")) {
    if (salary) {
      const current = Array.isArray(plan.applicationFieldsValues) ? plan.applicationFieldsValues : [];
      plan.applicationFieldsValues = [...current.filter(v => v?.slug !== "salary_expectation"), { slug: "salary_expectation", value: Number(salary) }];
    } else if (requested.some(field => field.slug === "salary_expectation" && field.isRequired)) missing.push("Pretensão salarial");
  }
  const requiresRg = (v: unknown): boolean => Boolean(v && typeof v === "object" && Object.entries(v).some(([key, node]) =>
    key === "identityCardNumber" && node && typeof node === "object" && "visible" in node && node.visible === true
      || requiresRg(node)));
  if (requiresRg(registration.schema)) {
    if (profile.rg) plan.identityCardNumber = profile.rg.replace(/[.\-\s]/g, "");
    else if (!plan.identityCardNumber) missing.push("RG solicitado pela empresa");
  }
  return { values: plan, missing };
}

export type Mailer = { send(message: { to: string; subject: string; text: string; pdf: Buffer }): Promise<void> };
type Extras = { mailer?: Mailer; resume?: () => Promise<Buffer>; links?: { github: string; linkedin: string; portfolio: string } };

function failure(error: unknown) {
  if (error instanceof GupyRequestError) return `gupy_http_${error.status}`;
  const cause = error instanceof Error ? error.cause : undefined;
  return typeof cause === "string" ? cause.slice(0, 80) : error instanceof z.ZodError ? "gupy_unexpected_shape" : "network_or_timeout";
}
const sameName = (a: string, b: string) => a.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase() === b.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();

export class ApplicationFlow {
  constructor(readonly bot: TelegramWorker, readonly key: string, readonly origin: string, readonly session: unknown, readonly extras: Extras = {}) {}
  get state() { return this.bot.state.flow; }
  candidate() { return this.state.vault ? candidateSchema.parse(openPrivate(this.state.vault, this.key, "candidate")) : candidateSchema.parse({}); }
  client() { return new GupyApplications(this.session, this.key); }

  async link() {
    const token = randomBytes(32).toString("hex");
    this.state.portal = { ticketHash: digest(token), ticketUntil: Date.now() + 15 * 60000 };
    await this.bot.save();
    return `${this.origin}/cadastro#${token}`;
  }

  async command(action: string, data?: string): Promise<string | void> {
    if (action === "cadastro") {
      await this.bot.message("Abra seu cadastro privado. O link vale por 15 minutos e uma única abertura. Preencha documentos e salários somente nessa página.", {
        inline_keyboard: [[{ text: "Abrir cadastro e revisões", url: await this.link() }]],
      });
    } else if (action === "candidaturas") {
      const selected = Object.entries(this.bot.state.entries).filter(([, e]) => e.status === "interesse" && e.vacancy.source === "Gupy");
      if (!selected.length) await this.bot.message("Nenhuma vaga selecionada. Toque em Tenho interesse no aviso de uma vaga.");
      for (const [id, entry] of selected.slice(0, 15)) {
        const app = this.state.applications[id];
        await this.bot.message(`${entry.vacancy.title}\n${app ? this.status(id) : "Ainda não candidatado"}`, { inline_keyboard: [
          [{ text: app?.applicationId ? "Concluir candidatura" : "Candidatar em 1 toque", callback_data: `candidatar:${id}` }],
          [{ text: "Abrir na Gupy", url: this.applicationUrl(id) }],
        ] });
      }
    } else if (action === "pendencias" || action === "sincronizar") {
      await this.sync(true);
    } else if (action === "preparar" && data) {
      await this.prepare(data);
      return "Revisão preparada. Abra o cadastro privado.";
    } else if (action === "candidatar" && data) {
      return this.quick(data);
    } else if (action === "email") {
      return data && /^[a-f0-9]{24}$/.test(data) ? this.emailForVacancy(data) : this.emailCommand(data || "");
    } else if (action === "enviar" && data) return this.sendEmail(data);
    else if (action === "descartar" && data) {
      const draft = this.state.emails[data];
      if (draft?.status === "draft") { delete this.state.emails[data]; await this.bot.save(); return "E-mail descartado. Nada foi enviado."; }
      return "Não há rascunho para descartar.";
    } else if (action === "aprovar" && data) return this.approve(data);
    else if (action === "cancelar" && data) {
      const app = this.state.applications[data];
      if (app && ["review", "pending"].includes(app.status)) {
        app.status = "cancelled"; app.snapshot = undefined; app.reviewedHash = undefined; await this.bot.save();
        return "Automação desta vaga cancelada. Uma inscrição já iniciada na Gupy continua lá.";
      }
      return "Não há revisão disponível para cancelar.";
    }
  }

  applicationUrl(id: string) {
    const target = gupyTarget(this.bot.state.entries[id].vacancy);
    const app = this.state.applications[id];
    return app?.applicationId ? `${target.origin}/candidates/applications/${app.applicationId}` : this.bot.state.entries[id].vacancy.url;
  }

  status(id: string) {
    const app = this.state.applications[id];
    return { review: "Revisão aguardando aprovação", starting: "Operação iniciada; aguardando confirmação", pending: "Inscrição iniciada; cadastro ou respostas pendentes", sent: "Cadastro da candidatura confirmado pela Gupy", unknown: "Resultado incerto; confira na Gupy antes de tentar novamente", cancelled: "Automação cancelada" }[app.status];
  }

  async prepare(id: string) {
    const entry = this.bot.state.entries[id];
    if (!entry || entry.status !== "interesse" || entry.vacancy.source !== "Gupy") throw new Error("Selecione uma vaga da Gupy.");
    const previous = this.state.applications[id];
    if (previous && ["starting", "unknown", "sent"].includes(previous.status)) {
      await this.bot.message(`${entry.vacancy.title}\n${this.status(id)}\n${this.applicationUrl(id)}\nUse /sincronizar para conferir as etapas.`); return;
    }
    const target = gupyTarget(entry.vacancy);
    const client = this.client();
    const preview = await client.preview(target.jobId);
    if (`https://${preview.job.company.subdomain}.gupy.io` !== target.origin) throw new Error("Destino da vaga não confirmado.");
    const draft: ApplicationDraft = { phase: previous?.applicationId ? "complete" : "start", preview, missing: [] };
    if (previous?.applicationId) {
      const details = await client.details(previous.applicationId);
      if (details.registrationComplete) {
        await this.refresh(id);
        await this.bot.message(`${entry.vacancy.title}\nCadastro já confirmado pela Gupy. Use /pendencias para as próximas etapas.`);
        return;
      }
      const register = details.job.jobSteps.find(step => step.type === "register" && step.applicationStep?.id === previous.registerStepId);
      if (!register || !previous.registerStepId) throw new Error("Etapa de cadastro não confirmada.");
      const registration = await client.registration(previous.applicationId, previous.registerStepId, register.id);
      const plan = additionalPlan(this.candidate(), target.title, preview.fields, registration);
      draft.registration = registration; draft.additional = plan.values; draft.missing = plan.missing;
      for (const question of registration.questions) {
        const answer = question.answer ?? question.answers;
        const selected = Array.isArray(question.options) && question.options.some(option => option && typeof option === "object" && "selected" in option && option.selected === true);
        if ((answer === undefined || answer === null || answer === "" || Array.isArray(answer) && !answer.length) && !selected)
          draft.missing.push(`Responda na Gupy: ${String(question.title || question.description || "Pergunta da empresa").slice(0, 200)}`);
      }
    }
    this.state.applications[id] = {
      ...previous, status: "review", nonce: randomBytes(8).toString("hex"), expiresAt: Date.now() + 30 * 60000,
      profileVersion: this.state.version, snapshot: sealPrivate(draft, this.key, `draft:${id}`), snapshotHash: digest(draft),
      reviewedHash: undefined, tasks: previous?.tasks || [], remindedAt: previous?.remindedAt || 0,
    };
    await this.bot.save();
    await this.bot.message(`${target.title}\n\n${draft.phase === "start" ? "Primeiro, autorize iniciar a inscrição. Isso cria um cadastro na empresa; a conclusão será revisada depois." : "Revise os dados para concluir o cadastro da candidatura."}\n\nSerá usado o currículo já cadastrado na Gupy. O PDF do Evoluir não substitui esse currículo automaticamente.\n${maskedCandidate(this.candidate())}\n\nAbra a revisão privada para ver o currículo e os dados exatos.`, {
      inline_keyboard: [[{ text: "Revisar em privado", url: await this.link() }], [{ text: "Cancelar automação", callback_data: `cancelar:${id}` }]],
    });
  }

  // Confere na conta Gupy se uma inscrição de resultado incerto existe. Sem isso, uma falha de rede travava a vaga para sempre.
  async reconcile(id: string) {
    const app = this.state.applications[id];
    if (!app || app.applicationId || !["unknown", "starting"].includes(app.status)) return;
    const target = gupyTarget(this.bot.state.entries[id].vacancy);
    const subdomain = new URL(target.origin).hostname.split(".")[0];
    const existing = (await this.client().applications()).find(item => item.careerPageSubdomain === subdomain && sameName(item.jobName, target.title));
    if (existing) {
      app.applicationId = existing.applicationId;
      const details = await this.client().details(existing.applicationId);
      app.registerStepId = details.job.jobSteps.find(step => step.type === "register" && step.applicationStep)?.applicationStep?.id;
      app.status = "pending"; await this.bot.save(); await this.refresh(id);
    } else { app.status = "cancelled"; app.snapshot = undefined; await this.bot.save(); }
  }

  // Candidatura em 1 toque: mostra o resumo exato no Telegram; a confirmação seguinte inicia e conclui o cadastro.
  async quick(id: string): Promise<string> {
    const entry = this.bot.state.entries[id];
    if (!entry || entry.vacancy.source !== "Gupy") return "Vaga indisponível.";
    if (entry.status !== "interesse") { entry.status = "interesse"; await this.bot.save(); }
    if (this.bot.state.gupy?.status !== "connected") {
      await this.bot.message("A sessão da Gupy não está conectada. Use /gupy para reconectar e tente de novo; a vaga ficou salva em /candidaturas.");
      return "Gupy desconectada.";
    }
    await this.reconcile(id);
    const previous = this.state.applications[id];
    if (previous && ["sent", "starting"].includes(previous.status)) {
      await this.bot.message(`${entry.vacancy.title}\n${this.status(id)}\n${this.applicationUrl(id)}`); return "Já registrada.";
    }
    const target = gupyTarget(entry.vacancy);
    const preview = await this.client().preview(target.jobId);
    if (`https://${preview.job.company.subdomain}.gupy.io` !== target.origin) throw new Error("Destino da vaga não confirmado.");
    const plan = additionalPlan(this.candidate(), target.title, preview.fields, { schema: {}, additional: {} });
    const draft: ApplicationDraft = { phase: previous?.applicationId ? "complete" : "start", preview, missing: [] };
    const hash = digest(draft);
    this.state.applications[id] = {
      ...previous, status: "review", nonce: randomBytes(8).toString("hex"), expiresAt: Date.now() + 30 * 60000,
      profileVersion: this.state.version, snapshot: sealPrivate(draft, this.key, `draft:${id}`), snapshotHash: hash,
      reviewedHash: hash, oneTap: true, error: undefined, tasks: previous?.tasks || [], remindedAt: previous?.remindedAt || 0,
    };
    await this.bot.save();
    const profile = z.object({ profile: z.object({ firstName: z.string(), lastName: z.string(), email: z.string() }) }).safeParse(preview.curriculum);
    const name = profile.success ? `${profile.data.profile.firstName} ${profile.data.profile.lastName}` : "seu perfil";
    const salary = plan.values.applicationFieldsValues as { value: number }[] | undefined;
    const app = this.state.applications[id];
    await this.bot.message(`Confirmar candidatura?\n\n${target.title}\nEmpresa: ${preview.job.company.subdomain}\n\nCurrículo: o que está na sua conta Gupy (${name}).${salary?.length ? `\nPretensão salarial: R$ ${salary[0].value}` : ""}${plan.missing.length ? `\n\nFalta no /cadastro: ${plan.missing.join(", ")}. A empresa pode pedir isso; complete antes ou termine pela Gupy.` : ""}\n\nAo confirmar, o bot inicia a inscrição e conclui o cadastro. Perguntas da empresa sem resposta e testes ficam para você responder na Gupy.\nVale por 30 minutos.`, {
      inline_keyboard: [[{ text: "Confirmar candidatura", callback_data: `aprovar:${id}:${app.nonce}` }], [{ text: "Cancelar", callback_data: `cancelar:${id}` }]],
    });
    return "Confira o resumo e confirme.";
  }

  // Depois do início confirmado em 1 toque, conclui o cadastro se nada depender de resposta pessoal.
  async finishOneTap(id: string, fields: unknown) {
    const app = this.state.applications[id];
    const title = this.bot.state.entries[id].vacancy.title;
    if (!app.applicationId || !app.registerStepId) {
      await this.bot.message(`Inscrição iniciada: ${title}.\nA Gupy não informou a etapa de cadastro; conclua pela plataforma.\n${this.applicationUrl(id)}`); return;
    }
    const client = this.client();
    const details = await client.details(app.applicationId);
    if (details.registrationComplete) { await this.refresh(id); await this.bot.message(`Candidatura enviada: ${title}.\n${this.applicationUrl(id)}\n\nUse /pendencias para acompanhar testes e etapas.`); return; }
    const register = details.job.jobSteps.find(step => step.type === "register" && step.applicationStep?.id === app.registerStepId);
    if (!register) { await this.bot.message(`Inscrição iniciada: ${title}.\nConclua o cadastro pela Gupy.\n${this.applicationUrl(id)}`); return; }
    const registration = await client.registration(app.applicationId, app.registerStepId, register.id);
    const plan = additionalPlan(this.candidate(), title, fields, registration);
    for (const question of registration.questions) {
      const answer = question.answer ?? question.answers;
      const selected = Array.isArray(question.options) && question.options.some(option => option && typeof option === "object" && "selected" in option && option.selected === true);
      if ((answer === undefined || answer === null || answer === "" || Array.isArray(answer) && !answer.length) && !selected)
        plan.missing.push(String(question.title || question.description || "Pergunta da empresa").slice(0, 200));
    }
    if (plan.missing.length) {
      app.snapshot = undefined; await this.bot.save();
      await this.bot.message(`Inscrição iniciada: ${title}.\n\nA empresa pede respostas suas antes de concluir:\n• ${plan.missing.join("\n• ")}\n\nResponda na Gupy para finalizar.\n${this.applicationUrl(id)}`); return;
    }
    if (digest(plan.values) !== digest(registration.additional)) await client.saveAdditional(app.applicationId, plan.values);
    await client.complete(app.applicationId, app.registerStepId);
    app.snapshot = undefined;
    await this.refresh(id);
    await this.bot.message(`${app.status === "sent" ? "Candidatura enviada" : "Cadastro enviado; aguardando confirmação da Gupy"}: ${title}.\n${this.applicationUrl(id)}\n\nUse /pendencias para acompanhar testes e etapas.`);
  }

  emailTemplate(title: string) {
    const candidate = this.candidate();
    const links = this.extras.links;
    const name = candidate.fullName || "Candidato";
    return {
      subject: `Candidatura — ${title.slice(0, 120)} — ${name}`,
      body: `Olá,\n\nTenho interesse na vaga de ${title.slice(0, 160)} e envio meu currículo em anexo.\n\nSou desenvolvedor focado em Java e busco uma oportunidade de júnior ou estágio para contribuir com a equipe e continuar evoluindo.\n${links ? `\nLinkedIn: ${links.linkedin}\nGitHub: ${links.github}\nPortfólio: ${links.portfolio}\n` : ""}\nFico à disposição para conversar.\n\nAtenciosamente,\n${name}${candidate.phone ? `\n${candidate.phone}` : ""}${candidate.email ? `\n${candidate.email}` : ""}`,
    };
  }

  async emailDraft(key: string, to: string, title: string) {
    if (!this.extras.mailer || !this.extras.resume) {
      await this.bot.message("O envio por e-mail ainda não está configurado no servidor (falta a senha de app do Gmail). Nada foi enviado."); return "E-mail não configurado.";
    }
    if (!this.candidate().fullName) { await this.bot.message("Preencha seu nome completo em /cadastro antes de enviar currículo por e-mail."); return "Complete o cadastro."; }
    const previous = this.state.emails[key];
    if (previous && ["sending", "sent"].includes(previous.status)) {
      await this.bot.message(`Currículo já ${previous.status === "sent" ? `enviado para ${previous.to} em ${new Date(previous.sentAt!).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "em envio"}. Não será repetido.`); return "Já enviado.";
    }
    const { subject, body } = this.emailTemplate(title);
    const draft = { to, subject, body, status: "draft" as const, nonce: randomBytes(8).toString("hex"), expiresAt: Date.now() + 30 * 60000 };
    this.state.emails[key] = draft; await this.bot.save();
    await this.bot.message(`Rascunho de e-mail\n\nPara: ${to}\nAssunto: ${subject}\nAnexo: currículo em PDF\n\n${body}\n\nConfira o destinatário. Vale por 30 minutos.`, {
      inline_keyboard: [[{ text: `Enviar para ${to}`, callback_data: `enviar:${key}:${draft.nonce}` }], [{ text: "Descartar", callback_data: `descartar:${key}` }]],
    });
    return "Confira o rascunho e confirme.";
  }

  async emailForVacancy(id: string) {
    const entry = this.bot.state.entries[id];
    const to = entry && recruiterEmails(entry.vacancy.description)[0];
    if (!to) return "Esta vaga não informa e-mail de contato.";
    return this.emailDraft(id, to, entry.vacancy.title);
  }

  async emailCommand(text: string) {
    const match = /^([^\s@]+@[^\s@]+\.[^\s@]+)\s+(.{3,160})$/s.exec(text.trim());
    const to = match && z.email().safeParse(match[1].toLowerCase());
    if (!match || !to?.success) {
      await this.bot.message("Para enviar seu currículo por e-mail:\n/email recrutador@empresa.com Título da vaga\n\nO bot mostra o e-mail completo antes; nada é enviado sem sua confirmação."); return "Formato inválido.";
    }
    return this.emailDraft(digest({ to: to.data, title: match[2].trim() }).slice(0, 24), to.data, match[2].trim());
  }

  async sendEmail(data: string) {
    const [key, nonce] = data.split(":");
    const draft = this.state.emails[key];
    if (!draft || draft.status !== "draft" || draft.nonce !== nonce || draft.expiresAt < Date.now()) return "Rascunho vencido ou já usado. Gere outro.";
    if (!this.extras.mailer || !this.extras.resume) return "E-mail não configurado.";
    // Gravar antes de enviar: um timeout não pode causar um segundo e-mail ao recrutador.
    draft.status = "sending"; await this.bot.save();
    try {
      await this.extras.mailer.send({ to: draft.to, subject: draft.subject, text: draft.body, pdf: await this.extras.resume() });
      draft.status = "sent"; draft.sentAt = new Date().toISOString(); await this.bot.save();
      await this.bot.message(`Currículo enviado para ${draft.to}.\nAssunto: ${draft.subject}`);
      return "E-mail enviado.";
    } catch (error) {
      draft.status = "failed"; draft.error = failure(error); await this.bot.save();
      console.error(`Envio de e-mail não confirmado: ${draft.error}.`);
      await this.bot.message(`O e-mail para ${draft.to} não foi confirmado pelo Gmail (${draft.error}). Confira a pasta Enviados antes de tentar de novo.`);
      return "Envio não confirmado.";
    }
  }

  draft(id: string) {
    const app = this.state.applications[id];
    if (!app?.snapshot) throw new Error("Revisão indisponível.");
    return draftSchema.parse(openPrivate(app.snapshot, this.key, `draft:${id}`));
  }

  async reviewed(id: string, hash: string) {
    const app = this.state.applications[id];
    if (!app || !app.snapshot || !app.snapshotHash || app.status !== "review" || app.expiresAt < Date.now() || app.profileVersion !== this.state.version || app.snapshotHash !== hash)
      throw new Error("Revisão vencida. Prepare novamente em /candidaturas.");
    const draft = this.draft(id);
    if (draft.missing.length) throw new Error("Preencha os dados pendentes e prepare uma nova revisão.");
    app.reviewedHash = hash;
    await this.bot.save();
    await this.bot.message(`${this.bot.state.entries[id].vacancy.title}\n\nRevisão privada confirmada. ${draft.phase === "start" ? "Autoriza iniciar a inscrição nesta empresa? O cadastro só será concluído após nova revisão." : "Autoriza enviar os dados revisados e concluir o cadastro? Testes serão feitos por você."}\nA autorização vence em 30 minutos e vale somente para esta versão.`, {
      inline_keyboard: [[{ text: draft.phase === "start" ? "Autorizar início" : "Confirmar envio", callback_data: `aprovar:${id}:${app.nonce}` }], [{ text: "Cancelar", callback_data: `cancelar:${id}` }]],
    });
  }

  async approve(data: string) {
    const [id, nonce] = data.split(":");
    const app = this.state.applications[id];
    if (!app || !app.snapshot || !app.snapshotHash || app.status !== "review" || app.nonce !== nonce || app.expiresAt < Date.now() || app.profileVersion !== this.state.version || app.reviewedHash !== app.snapshotHash)
      return "Aprovação vencida ou já utilizada. Revise novamente em /candidaturas.";
    const draft = this.draft(id);
    if (draft.missing.length) return "Há dados pendentes no cadastro privado.";
    const client = this.client();
    const fresh = await client.preview(gupyTarget(this.bot.state.entries[id].vacancy).jobId);
    if (digest(fresh) !== digest(draft.preview)) return "O currículo ou a vaga mudou na Gupy. Prepare uma nova revisão.";
    if (draft.phase === "complete" && app.applicationId && !app.oneTap) {
      const details = await client.details(app.applicationId);
      if (details.registrationComplete) {
        await this.refresh(id);
        return "A Gupy já confirmou o cadastro. Use /pendencias para as próximas etapas.";
      }
      const register = details.job.jobSteps.find(step => step.type === "register" && step.applicationStep?.id === app.registerStepId);
      if (!register || !app.registerStepId)
        return "A etapa de cadastro não foi confirmada pela Gupy. Conclua na plataforma.";
      const registration = await client.registration(app.applicationId, app.registerStepId, register.id);
      if (digest(registration) !== digest(draft.registration)) return "O formulário da empresa mudou. Prepare uma nova revisão.";
    }
    // Persistir antes do primeiro efeito externo impede repetir um envio após timeout ou reinício.
    app.status = "starting"; app.reviewedHash = undefined; await this.bot.save();
    let mutationStarted = false;
    try {
      mutationStarted = true;
      if (app.oneTap) {
        if (draft.phase === "start") {
          const receipt = await client.start(gupyTarget(this.bot.state.entries[id].vacancy).jobId);
          app.applicationId = receipt.applicationId; app.registerStepId = receipt.registerStepId;
          app.status = "pending"; await this.bot.save();
        } else app.status = "pending";
        await this.finishOneTap(id, draft.preview.fields);
        mutationStarted = false;
      } else if (draft.phase === "start") {
        const receipt = await client.start(gupyTarget(this.bot.state.entries[id].vacancy).jobId);
        app.applicationId = receipt.applicationId; app.registerStepId = receipt.registerStepId;
        app.status = "pending"; app.snapshot = undefined; await this.bot.save();
        await this.refresh(id);
        mutationStarted = false;
        await this.bot.message(`Inscrição iniciada na Gupy: ${this.bot.state.entries[id].vacancy.title}.\n${this.status(id)}.\n\nUse /candidaturas para revisar e concluir. Perguntas da empresa que precisem de resposta pessoal ficam na Gupy.\n${this.applicationUrl(id)}`);
      } else {
        if (!app.applicationId || !app.registerStepId) throw new Error("Comprovante de inscrição ausente.");
        if (draft.additional && digest(draft.additional) !== digest((draft.registration as { additional: unknown }).additional))
          await client.saveAdditional(app.applicationId, draft.additional);
        await client.complete(app.applicationId, app.registerStepId);
        await this.refresh(id);
        mutationStarted = false;
        await this.bot.message(`${this.bot.state.entries[id].vacancy.title}\n${this.status(id)}.\n${this.applicationUrl(id)}\n\nUse /pendencias para acompanhar testes e outras etapas.`);
      }
      return "Resposta da Gupy registrada. Confira a mensagem do bot.";
    } catch (error) {
      if (!mutationStarted) return "Operação registrada, mas o aviso não foi entregue. Use /pendencias para consultar.";
      app.error = failure(error);
      app.status = error instanceof GupyRequestError && [400, 401, 403, 422].includes(error.status) ? (app.applicationId ? "pending" : "cancelled") : app.applicationId ? "pending" : "unknown";
      await this.bot.save();
      console.error(`Candidatura não confirmada: ${app.error}. Dados omitidos.`);
      // Resultado incerto: consulta a conta antes de decidir; nunca reenvia às cegas.
      try { await this.reconcile(id); } catch { /* mantém "unknown"; a próxima tentativa reconcilia de novo */ }
      const created = Boolean(app.applicationId);
      await this.bot.message(app.status === "unknown"
        ? `A Gupy não respondeu (${app.error}). Não foi possível confirmar se a inscrição foi criada. Toque em Candidatar de novo mais tarde: o bot confere na sua conta antes de repetir.\n${this.applicationUrl(id)}`
        : created
          ? `Inscrição criada, mas a conclusão não foi confirmada (${app.error}). Termine pela Gupy ou toque em Candidatar de novo.\n${this.applicationUrl(id)}`
          : `A Gupy recusou a inscrição (${app.error}). Nada foi criado na sua conta. Você pode tocar em Candidatar de novo ou se inscrever pelo site.\n${this.applicationUrl(id)}`);
      return "Envio não confirmado. Confira a mensagem do bot.";
    }
  }

  async refresh(id: string) {
    const app = this.state.applications[id];
    if (!app.applicationId) return;
    const details = await this.client().details(app.applicationId);
    if (details.job.id !== gupyTarget(this.bot.state.entries[id].vacancy).jobId) throw new Error("Comprovante pertence a outra vaga.");
    if (details.registrationComplete) app.status = "sent";
    else if (app.status !== "review" && app.status !== "cancelled") app.status = "pending";
    app.tasks = details.job.jobSteps.filter(step => step.applicationStep && step.type !== "register" && step.category !== "hiring").map(step => ({
      id: String(step.applicationStep!.id), name: step.name, status: step.applicationStep!.status,
      url: `${gupyTarget(this.bot.state.entries[id].vacancy).origin}/candidates/applications/${app.applicationId}/steps/${step.applicationStep!.id}`,
    }));
    app.checkedAt = new Date().toISOString(); await this.bot.save();
  }

  async sync(explicit = false) {
    let count = 0;
    for (const [id, app] of Object.entries(this.state.applications)) {
      if (!app.applicationId || app.status === "cancelled") continue;
      const before = digest(app.tasks);
      try { await this.refresh(id); }
      catch { if (explicit) await this.bot.message("Não foi possível atualizar as etapas na Gupy. Último estado preservado; confira /gupy."); continue; }
      const pending = app.tasks.filter(task => !["done", "approved", "skipped", "reproved"].includes(task.status));
      if (explicit || pending.length && (digest(app.tasks) !== before || Date.now() - app.remindedAt >= 86400000)) {
        app.remindedAt = Date.now(); await this.bot.save();
        await this.bot.message(`${this.bot.state.entries[id].vacancy.title}\n${this.status(id)}\n\n${pending.length ? pending.map(t => `${t.name} · ${t.status}\n${t.url}`).join("\n\n") : "Nenhuma etapa pendente retornada pela Gupy."}\n\nTestes de raciocínio, comportamentais e psicotécnicos são respondidos por você. Abrir o link não conclui uma etapa.`, {
          inline_keyboard: [[{ text: "Abrir candidatura", url: this.applicationUrl(id) }]],
        });
      }
      count++;
    }
    if (explicit && !count) await this.bot.message("Ainda não há candidatura com etapas confirmadas para acompanhar. Use /candidaturas.");
  }
}
