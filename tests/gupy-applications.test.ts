import { afterEach, expect, it, vi } from "vitest";
import { GupyApplications, GupyRequestError, gupyTarget } from "../server/gupy-applications";
import { sealGupySession } from "../server/gupy-session";
const key = "1".repeat(64);
const vacancy = { title: "Java Júnior", url: "https://empresa.gupy.io/jobs/42", source: "Gupy", publishedAt: "2026-11-05T00:00:00.000Z", description: "Java", labels: [] };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function client() { return new GupyApplications(sealGupySession({ authorization: "Bearer fake-test-session" }, key), key); }
it("deriva destino de uma vaga Gupy validada e rejeita URLs externas", () => {
  expect(gupyTarget(vacancy)).toEqual({ jobId: 42, title: "Java Júnior", origin: "https://empresa.gupy.io" });
  const token = Buffer.from(JSON.stringify({ jobId: 77, source: "gupy_portal" })).toString("base64");
  expect(gupyTarget({ ...vacancy, url: `https://empresa.gupy.io/job/${token}` }).jobId).toBe(77);
  for (const url of ["https://evil.example/jobs/42", "https://empresa.gupy.io.evil.example/jobs/42", "http://empresa.gupy.io/jobs/42", "https://empresa.gupy.io/jobs/-1"])
    expect(() => gupyTarget({ ...vacancy, url })).toThrow();
});
it("inicia pelo contrato observado, não envia documentos ou respostas de testes e não repete POST", async () => {
  const remote = vi.fn().mockResolvedValue(Response.json({ applicationId: 101, registerStepId: 202 })); vi.stubGlobal("fetch", remote);
  expect(await client().start(42)).toEqual({ applicationId: 101, registerStepId: 202 });
  expect(remote).toHaveBeenCalledWith("https://private-api.gupy.io/selection-process/candidate/application", expect.objectContaining({
    method: "POST", redirect: "error", body: JSON.stringify({ jobId: 42, partnerName: "gupy_portal" }),
  }));
  remote.mockResolvedValue(new Response("private provider error", { status: 503 }));
  await expect(client().start(42)).rejects.toBeInstanceOf(GupyRequestError);
  expect(remote).toHaveBeenCalledTimes(2);
});
it("não aceita resultado sem comprovante e valida ids antes de enviar", async () => {
  const remote = vi.fn().mockResolvedValue(Response.json({ success: true })); vi.stubGlobal("fetch", remote);
  await expect(client().start(42)).rejects.toThrow();
  await expect(client().complete(-1, 42)).rejects.toThrow(); expect(remote).toHaveBeenCalledTimes(1);
});
