import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sealGupySession } from "../server/gupy-session";
import { firefox } from "@playwright/test";

let folder: string; let pending: string; let sealed: ReturnType<typeof sealGupySession>;
const originalExitCode = process.exitCode;
const originalArgv = [...process.argv];
vi.mock("node:os", async () => ({ ...await vi.importActual<typeof import("node:os")>("node:os"), homedir: () => folder }));
vi.mock("@playwright/test", () => ({ firefox: { launch: vi.fn() } }));
vi.mock("vite", () => ({ createServer: async () => ({
  ssrLoadModule: () => import("../server/gupy-session"), close: vi.fn(),
}) }));
beforeEach(() => {
  vi.resetModules();
  folder = mkdtempSync(join(tmpdir(), "gupy-connection-"));
  const config = join(folder, ".config", "evoluir-telegram"); mkdirSync(config, { recursive: true, mode: 0o700 });
  writeFileSync(join(config, "cloud-secrets.json"), JSON.stringify({ store: "a".repeat(64), gupyKey: "b".repeat(64) }), { mode: 0o600 });
  writeFileSync(join(config, "deployment.json"), JSON.stringify({ url: "https://example.onrender.com" }));
  sealed = sealGupySession({ cookie: "session=fake-private-value" }, "b".repeat(64));
  pending = join(config, "gupy-pending-session.json"); writeFileSync(pending, JSON.stringify(sealed), { mode: 0o600 });
  vi.spyOn(console, "log").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  process.exitCode = originalExitCode; process.argv = [...originalArgv]; rmSync(folder, { recursive: true, force: true });
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks();
});
it("falha temporária preserva a sessão cifrada e não pede um segundo login", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
  await import("../scripts/connect-gupy.mjs");
  expect(JSON.parse(readFileSync(pending, "utf8"))).toEqual(sealed);
  expect(statSync(pending).mode & 0o777).toBe(0o600);
  expect(firefox.launch).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
});
it("confirmação do servidor conclui a tentativa salva sem abrir outra janela", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: true })));
  await import("../scripts/connect-gupy.mjs");
  expect(existsSync(pending)).toBe(false);
  expect(firefox.launch).not.toHaveBeenCalled();
});
it("pedido de novo login abre Firefox sem apagar a tentativa cifrada anterior", async () => {
  process.argv.push("--login");
  vi.mocked(firefox.launch).mockRejectedValueOnce(new Error("Interromper após abrir navegador de teste."));
  vi.stubGlobal("fetch", vi.fn());
  await import("../scripts/connect-gupy.mjs");
  expect(firefox.launch).toHaveBeenCalledWith(expect.objectContaining({ executablePath: "/usr/bin/firefox", channel: "moz-firefox" }));
  expect(JSON.parse(readFileSync(pending, "utf8"))).toEqual(sealed);
  expect(fetch).not.toHaveBeenCalled();
});
