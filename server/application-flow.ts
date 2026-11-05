import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { TelegramWorker } from "./telegram.js";
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

export class ApplicationFlow {
  constructor(readonly bot: TelegramWorker, readonly key: string, readonly origin: string, readonly session: unknown) {}
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
        await this.bot.message(`${entry.vacancy.title}\n${app ? this.status(id) : "Aguardando preparação"}`, { inline_keyboard: [
          [{ text: app?.applicationId ? "Revisar dados para concluir" : "Preparar candidatura", callback_data: `preparar:${id}` }],
          [{ text: "Abrir na Gupy", url: this.applicationUrl(id) }],
        ] });
      }
    } else if (action === "pendencias" || action === "sincronizar") {
      await this.sync(true);
    } else if (action === "preparar" && data) {
      await this.prepare(data);
      return "Revisão preparada. Abra o cadastro privado.";
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
    if (draft.phase === "complete" && app.applicationId) {
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
      if (draft.phase === "start") {
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
      if (mutationStarted) {
        app.status = error instanceof GupyRequestError && [400, 401, 403, 422].includes(error.status) ? (app.applicationId ? "pending" : "cancelled") : "unknown";
        await this.bot.save();
      }
      await this.bot.message(`A Gupy não confirmou a conclusão. ${this.status(id)}.\nConfira as perguntas, documentos e a sessão diretamente na plataforma. O bot não repetirá um envio de resultado incerto.\n${this.applicationUrl(id)}`);
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
