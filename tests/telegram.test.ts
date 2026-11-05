import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TelegramWorker, matchesJavaEntry } from "../server/telegram";
import { searchJobs } from "../server/job-search";

vi.mock("../server/job-search", () => ({ searchJobs: vi.fn() }));
vi.mock("node:timers/promises", () => ({ setTimeout: vi.fn().mockResolvedValue(undefined) }));
let folder: string;
const config = { tokenFile: "", botUsername: "examplebot", pairCode: "a".repeat(24), intervalMinutes: 30, location: "" };
const vacancy = {
  title: "[Remoto] Java Júnior", url: "https://github.com/backend-br/vagas/issues/123",
  source: "Backend BR" as const, publishedAt: "2026-11-04T12:00:00.000Z", labels: [], description: "Java e Spring",
};
beforeEach(() => { folder = mkdtempSync(join(tmpdir(), "evoluir-telegram-")); });
afterEach(() => { rmSync(folder, { recursive: true, force: true }); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
function worker() {
  const bot = new TelegramWorker({ ...config, tokenFile: join(folder, "token") }, join(folder, "state.json"));
  vi.spyOn(bot, "api").mockResolvedValue(true);
  return bot;
}
function start(id = 123, text = `/start ${config.pairCode}`, type = "private") {
  return { update_id: 10, message: { chat: { id, type }, from: { id }, text } };
}
it("separa Java de JavaScript e exige nível no título ou etiquetas", () => {
  expect(matchesJavaEntry(vacancy)).toBe(true);
  expect(matchesJavaEntry({ ...vacancy, title: "Estagiário Backend", description: "Java" })).toBe(true);
  expect(matchesJavaEntry({ ...vacancy, title: "Java", labels: ["Júnior"] })).toBe(true);
  expect(matchesJavaEntry({ ...vacancy, title: "JavaScript Junior", description: "Node" })).toBe(false);
  expect(matchesJavaEntry({ ...vacancy, title: "Java Sênior", description: "Liderar pessoas junior" })).toBe(false);
});
it("vincula apenas uma conversa privada com o código e persiste com permissão privada", async () => {
  const bot = worker();
  await bot.handleUpdate(start(123, "/start incorreto"));
  expect(bot.state.chatId).toBeUndefined();
  await bot.handleUpdate({ ...start(123, undefined, "group"), update_id: 11 });
  expect(bot.state.chatId).toBeUndefined();
  await bot.handleUpdate({ ...start(), update_id: 12 });
  expect(bot.state.chatId).toBe(123);
  await bot.handleUpdate({ ...start(456), update_id: 13 });
  expect(bot.state.chatId).toBe(123);
  expect(statSync(bot.stateFile).mode & 0o777).toBe(0o600);
  expect(new TelegramWorker(bot.config, bot.stateFile).state.userId).toBe(123);
});
it("start comum responde sem vincular conta, revelar o código ou acessar o perfil", async () => {
  const bot = worker();
  await bot.handleUpdate(start(123, "/start"));
  expect(bot.state.chatId).toBeUndefined();
  expect(bot.api).toHaveBeenCalledWith("sendMessage", expect.objectContaining({ chat_id: 123, text: expect.stringContaining("bot está online") }));
  const reply = String(vi.mocked(bot.api).mock.calls[0][1]?.text);
  expect(reply).not.toContain(config.pairCode);
  expect(reply).not.toContain("curriculo.pdf");
});
it("aceita start com nome do bot e código sem permitir assumir uma conta vinculada", async () => {
  const bot = worker();
  await bot.handleUpdate(start(123, `/start@examplebot ${config.pairCode}`));
  expect(bot.state.chatId).toBe(123);
  await bot.handleUpdate({ ...start(456), update_id: 11 });
  expect(bot.state.chatId).toBe(123);
});
it("nuvem não consulta GitHub, não retoma fontes antigas e informa os conectores pendentes", async () => {
  const persist = vi.fn().mockResolvedValue(undefined);
  const bot = new TelegramWorker(config, "", { state: { paused: true }, persist });
  vi.spyOn(bot, "api").mockResolvedValue(true);
  await bot.handleUpdate(start());
  await bot.handleUpdate({ ...start(123, "/retomar"), update_id: 11 });
  await bot.handleUpdate({ ...start(123, "/status"), update_id: 12 });
  await bot.scan();
  expect(bot.state.paused).toBe(true);
  expect(searchJobs).not.toHaveBeenCalled();
  expect(bot.api).toHaveBeenLastCalledWith("sendMessage", expect.objectContaining({ text: expect.stringContaining("Busca e envio nessas plataformas ainda não conectados") }));
});
it("não consulta vagas antes da vinculação ou quando pausado", async () => {
  const bot = worker();
  await bot.scan();
  await bot.handleUpdate(start());
  await bot.handleUpdate({ ...start(123, "/pausar"), update_id: 11 });
  await bot.scan();
  expect(searchJobs).not.toHaveBeenCalled();
});
it("consulta as variantes separadas, evita duplicatas e respeita 30 minutos e reinícios", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  vi.mocked(searchJobs).mockResolvedValue({ items: [vacancy], total: 1, incomplete: false, updatedAt: vacancy.publishedAt });
  const now = Date.now();
  await bot.scan(now);
  expect(searchJobs).toHaveBeenCalledTimes(4);
  const notification = vi.mocked(bot.api).mock.calls.filter(([method, body]) => method === "sendMessage" && String(body?.text).startsWith("Nova vaga"));
  expect(notification).toHaveLength(1);
  expect(notification[0][1]?.reply_markup).toBeDefined();
  await bot.scan(now + 29 * 60000);
  expect(searchJobs).toHaveBeenCalledTimes(4);
  const restarted = new TelegramWorker(bot.config, bot.stateFile);
  vi.spyOn(restarted, "api").mockResolvedValue(true);
  await restarted.scan(now + 30 * 60000);
  expect(searchJobs).toHaveBeenCalledTimes(8);
  expect(restarted.api).not.toHaveBeenCalled();
});
it("ações de terceiros ou dados adulterados não mudam a seleção", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  const id = "b".repeat(24);
  bot.state.entries[id] = { vacancy, status: "notificada", at: vacancy.publishedAt };
  const callback = (user: number, data: string, update_id: number) => ({ update_id, callback_query: {
    id: `callback-${update_id}`, from: { id: user }, message: { chat: { id: 123, type: "private" } }, data,
  } });
  await bot.handleUpdate(callback(456, `interesse:${id}`, 11));
  expect(bot.state.entries[id].status).toBe("notificada");
  await bot.handleUpdate(callback(123, "interesse:../../etc", 12));
  expect(bot.state.entries[id].status).toBe("notificada");
  await bot.handleUpdate(callback(123, `interesse:${id}`, 13));
  expect(bot.state.entries[id].status).toBe("interesse");
  expect(bot.api).toHaveBeenLastCalledWith("answerCallbackQuery", expect.objectContaining({ text: "Interesse salvo. Nenhum currículo foi enviado." }));
});
it("preserva estado corrompido e interrompe a inicialização", () => {
  const path = join(folder, "state.json");
  writeFileSync(path, "{quebrado");
  expect(() => new TelegramWorker(config, path)).toThrow("Estado Telegram inválido");
  expect(readFileSync(path, "utf8")).toBe("{quebrado");
});
it("callback expirado não bloqueia novas mensagens após persistir a seleção", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  const id = "b".repeat(24);
  bot.state.entries[id] = { vacancy, status: "notificada", at: vacancy.publishedAt };
  vi.mocked(bot.api).mockRejectedValueOnce(new Error("callback expirado"));
  await bot.handleUpdate({ update_id: 11, callback_query: { id: "old", from: { id: 123 },
    message: { chat: { id: 123, type: "private" } }, data: `interesse:${id}` } });
  expect(bot.state.entries[id].status).toBe("interesse");
  expect(bot.state.offset).toBe(12);
  expect(new TelegramWorker(bot.config, bot.stateFile).state.offset).toBe(12);
});
it("falha da fonte não registra consulta bem-sucedida", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  vi.mocked(searchJobs).mockRejectedValue(new Error("indisponível"));
  await expect(bot.scan()).rejects.toThrow();
  expect(bot.state.lastSearch).toBe(0);
  expect(Object.keys(bot.state.entries)).toHaveLength(0);
});
it("entrega incerta fica registrada e não reenvia a mesma vaga", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  vi.mocked(searchJobs).mockResolvedValue({ items: [vacancy], total: 1, incomplete: false, updatedAt: vacancy.publishedAt });
  vi.mocked(bot.api).mockRejectedValueOnce(new Error("timeout"));
  await expect(bot.scan()).rejects.toThrow();
  expect(Object.values(bot.state.entries)[0].status).toBe("notificando");
  vi.mocked(bot.api).mockClear();
  await bot.scan();
  expect(bot.api).not.toHaveBeenCalled();
});
it("erros HTTP e exceções de rede não expõem o token", async () => {
  const token = `123456789:${"A".repeat(35)}`;
  const path = join(folder, "token");
  writeFileSync(path, token);
  const bot = new TelegramWorker({ ...config, tokenFile: path }, join(folder, "state.json"));
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(`https://api.telegram.org/bot${token}`)));
  await expect(bot.api("getMe")).rejects.toThrow("detalhes omitidos");
  try { await bot.api("getMe"); } catch (error) { expect(String(error)).not.toContain(token); }
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 401 })));
  await expect(bot.api("getMe")).rejects.toThrow("Falha Telegram");
});
it("preserva webhook existente e não inicia polling", async () => {
  const bot = worker();
  vi.mocked(bot.api).mockResolvedValueOnce({ username: config.botUsername }).mockResolvedValueOnce({ url: "https://example.com/webhook" });
  await expect(bot.run()).rejects.toThrow("Configuração existente preservada");
  expect(bot.api).not.toHaveBeenCalledWith("getUpdates", expect.anything());
  expect(bot.api).not.toHaveBeenCalledWith("deleteWebhook", expect.anything());
});
it("não inicia com token de outro bot", async () => {
  const bot = worker();
  vi.mocked(bot.api).mockResolvedValueOnce({ username: "otherbot" });
  await expect(bot.run()).rejects.toThrow("outro bot");
  expect(bot.api).toHaveBeenCalledTimes(1);
});
it("limita a dez avisos por rodada e deixa os demais para a próxima", async () => {
  const bot = worker();
  await bot.handleUpdate(start());
  const items = Array.from({ length: 11 }, (_, i) => ({ ...vacancy, url: `https://github.com/backend-br/vagas/issues/${i + 1}` }));
  vi.mocked(searchJobs).mockResolvedValue({ items, total: 11, incomplete: false, updatedAt: vacancy.publishedAt });
  const now = Date.now();
  await bot.scan(now);
  expect(Object.keys(bot.state.entries)).toHaveLength(10);
  await bot.scan(now + 30 * 60000);
  expect(Object.keys(bot.state.entries)).toHaveLength(11);
});
