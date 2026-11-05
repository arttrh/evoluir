import { afterEach, expect, it, vi } from "vitest";
import { ApplicationFlow, additionalPlan } from "../server/application-flow";
import { TelegramWorker } from "../server/telegram";
import { GupyApplications } from "../server/gupy-applications";
import { candidateSchema } from "../server/candidate-profile";
const id = "a".repeat(24);
const key = "1".repeat(64);
const vacancy = { title: "Java Júnior", url: "https://empresa.gupy.io/jobs/42", source: "Gupy", publishedAt: "2026-11-05T00:00:00.000Z", labels: [], description: "Java" };
const preview = { job: { id: 42, status: "published", name: "Java Júnior", company: { subdomain: "empresa" } }, curriculum: { profile: { firstName: "Nome privado", email: "teste@example.com" } }, fields: { fields: [] } };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function setup() {
  const persist = vi.fn().mockResolvedValue(undefined);
  const bot = new TelegramWorker({ tokenFile: "unused", botUsername: "examplebot", pairCode: "a".repeat(24), intervalMinutes: 30, location: "" }, "", {
    state: { chatId: 123, userId: 123, entries: { [id]: { vacancy, status: "interesse", at: "2026-11-05T00:00:00.000Z" } } }, persist,
  });
  vi.spyOn(bot, "api").mockResolvedValue(true);
  const flow = new ApplicationFlow(bot, key, "https://bot.example", {});
  const client = Object.create(GupyApplications.prototype) as GupyApplications;
  vi.spyOn(flow, "client").mockReturnValue(client);
  vi.spyOn(client, "preview").mockResolvedValue(structuredClone(preview));
  const start = vi.spyOn(client, "start").mockResolvedValue({ applicationId: 100, registerStepId: 200 });
  const complete = vi.spyOn(client, "complete").mockResolvedValue(null);
  vi.spyOn(client, "registration").mockResolvedValue({ schema: {}, additional: {}, questions: [] });
  vi.spyOn(client, "details").mockResolvedValue({ registrationComplete: false, job: { id: 42, jobSteps: [
    { id: 10, name: "Cadastro", type: "register", applicationStep: { id: 200, status: "not-started" } },
    { id: 11, name: "Raciocínio lógico", type: "online", applicationStep: { id: 201, status: "not-started" } },
  ] } });
  return { flow, bot, client, start, complete, persist };
}
it("interesse e preparação não enviam; exige revisão privada e aprovação vinculada à versão", async () => {
  const { flow, bot, start } = setup();
  await flow.prepare(id);
  const app = bot.state.flow.applications[id];
  expect(start).not.toHaveBeenCalled();
  expect(await flow.approve(`${id}:${app.nonce}`)).toContain("vencida");
  await expect(flow.reviewed(id, "wrong")).rejects.toThrow();
  await flow.reviewed(id, app.snapshotHash!);
  bot.state.flow.version++;
  expect(await flow.approve(`${id}:${app.nonce}`)).toContain("vencida");
  expect(start).not.toHaveBeenCalled();
  expect(JSON.stringify(bot.state)).not.toContain("Nome privado");
  expect(JSON.stringify(vi.mocked(bot.api).mock.calls)).not.toContain("teste@example.com");
});
it("uma aprovação inicia só uma inscrição e exige nova revisão para concluir", async () => {
  const { flow, bot, start, complete, client } = setup();
  await flow.prepare(id); let app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!); const callback = `${id}:${app.nonce}`;
  await flow.approve(callback); await flow.approve(callback);
  expect(start).toHaveBeenCalledTimes(1); expect(complete).not.toHaveBeenCalled();
  expect(app.status).toBe("pending");
  expect(app.tasks[0]).toMatchObject({ name: "Raciocínio lógico", status: "not-started" });
  await flow.prepare(id); app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!);
  vi.mocked(client.details).mockResolvedValueOnce({ registrationComplete: false, job: { id: 42, jobSteps: [{ id: 10, name: "Cadastro", type: "register", applicationStep: { id: 200, status: "not-started" } }] } })
    .mockResolvedValue({ registrationComplete: true, job: { id: 42, jobSteps: [] } });
  await flow.approve(`${id}:${app.nonce}`);
  expect(complete).toHaveBeenCalledWith(100, 200); expect(app.status).toBe("sent");
});
it("timeout após POST não repete a inscrição e resultado parcial não vira enviado", async () => {
  const { flow, bot, start } = setup();
  await flow.prepare(id); const app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!); start.mockRejectedValue(new Error("network"));
  await flow.approve(`${id}:${app.nonce}`); await flow.prepare(id);
  expect(app.status).toBe("unknown"); expect(start).toHaveBeenCalledTimes(1);
});
it("alteração no currículo remoto impede usar uma aprovação antiga", async () => {
  const { flow, bot, client, start } = setup(); await flow.prepare(id);
  const app = bot.state.flow.applications[id]; await flow.reviewed(id, app.snapshotHash!);
  vi.mocked(client.preview).mockResolvedValue({ ...preview, curriculum: { profile: { firstName: "Alterado" } } });
  expect(await flow.approve(`${id}:${app.nonce}`)).toContain("mudou"); expect(start).not.toHaveBeenCalled();
});
it("nunca conclui um teste mesmo se o comprovante apontar para uma etapa de avaliação", async () => {
  const { flow, bot, complete, client } = setup();
  await flow.prepare(id); let app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!); await flow.approve(`${id}:${app.nonce}`);
  await flow.prepare(id); app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!);
  vi.mocked(client.details).mockResolvedValue({ registrationComplete: false, job: { id: 42, jobSteps: [{ id: 10, name: "Psicotécnico", type: "online", applicationStep: { id: 200, status: "not-started" } }] } });
  expect(await flow.approve(`${id}:${app.nonce}`)).toContain("etapa de cadastro não foi confirmada");
  expect(complete).not.toHaveBeenCalled();
});
it("pergunta sem resposta fica pendente, sem inferir uma resposta a partir do perfil", async () => {
  const { flow, bot, client, complete } = setup();
  await flow.prepare(id); let app = bot.state.flow.applications[id];
  await flow.reviewed(id, app.snapshotHash!); await flow.approve(`${id}:${app.nonce}`);
  vi.mocked(client.registration).mockResolvedValue({ schema: {}, additional: {}, questions: [{ title: "Qual é sua disponibilidade?", answer: null }] });
  await flow.prepare(id); app = bot.state.flow.applications[id];
  expect(flow.draft(id).missing).toContain("Responda na Gupy: Qual é sua disponibilidade?");
  await expect(flow.reviewed(id, app.snapshotHash!)).rejects.toThrow("dados pendentes");
  expect(complete).not.toHaveBeenCalled();
});
it("somente mapeia salário/RG solicitados e preserva outros dados da inscrição", () => {
  const candidate = candidateSchema.parse({ salaryJunior: "3000", salaryIntern: "1800", rg: "12.345-6", motherName: "Nunca enviar sem campo reconhecido" });
  const registration = { schema: { personalInfo: { identityCardNumber: { visible: true } } }, additional: { isCompanyEmployee: true, custom: "preservado" } };
  const plan = additionalPlan(candidate, "Estágio Java", { fields: [{ slug: "salary_expectation", isRequired: true }] }, registration);
  expect(plan.values).toEqual({ ...registration.additional, identityCardNumber: "123456", applicationFieldsValues: [{ slug: "salary_expectation", value: 1800 }] });
  expect(additionalPlan(candidate, "Java Júnior", { fields: [] }, { ...registration, schema: {} }).values).toEqual(registration.additional);
  expect(additionalPlan(candidateSchema.parse({}), "Java Júnior", { fields: [{ slug: "salary_expectation", isRequired: true }] }, registration).missing).toHaveLength(2);
});
it("lembrete consulta o servidor, não responde teste nem marca link aberto como conclusão", async () => {
  const { flow, bot, client, start, complete } = setup();
  bot.state.flow.applications[id] = { status: "pending", nonce: "f".repeat(16), expiresAt: 0, profileVersion: 0, applicationId: 100, registerStepId: 200, tasks: [], remindedAt: 0 };
  await flow.sync(); await flow.sync();
  expect(client.details).toHaveBeenCalledTimes(2); expect(start).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
  expect(bot.state.flow.applications[id].tasks[0].status).toBe("not-started");
  expect(vi.mocked(bot.api).mock.calls.filter(([, body]) => String(body?.text).includes("respondidos por você"))).toHaveLength(1);
});
