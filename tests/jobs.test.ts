import { afterEach, expect, it, vi } from "vitest";
import { searchJobs } from "../server/job-search";
import handler from "../api/jobs";
import { changeJobStatus, emptyData, parseBackup, type Job } from "../src/model";
import type { ApiRequest, ApiResponse } from "../server/http";

const issue = {
  title: "[Remoto] Java Júnior na Empresa Exemplo",
  html_url: "https://github.com/backend-br/vagas/issues/123",
  created_at: new Date().toISOString(),
  state: "open",
  body: "Envie o currículo pelo site da empresa. <script>alert(1)</script>",
  labels: [{ name: "Júnior" }],
};
const filters = { q: "Java", location: "Remoto", source: "Todas" as const };
const job: Job = {
  id: "job-1", company: "Empresa", role: "Java", url: issue.html_url,
  date: "2026-11-02", status: "Encontrada", contact: "", notes: "",
};
afterEach(() => vi.unstubAllGlobals());

function mockIssues(items: unknown[], incomplete_results = false) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items, total_count: items.length, incomplete_results })));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
it("consulta somente os repositórios fixos e mantém o anúncio como texto", async () => {
  const fetch = mockIssues([issue]);
  const result = await searchJobs(filters);
  expect(result.items[0]).toMatchObject({ title: issue.title, source: "Backend BR", description: issue.body });
  const url = fetch.mock.calls[0][0] as URL;
  expect(url.origin).toBe("https://api.github.com");
  expect(url.pathname).toBe("/search/issues");
  expect(url.searchParams.get("q")).toContain('"Java" "Remoto" repo:backend-br/vagas repo:frontendbr/vagas is:issue is:open');
  expect(url.searchParams.get("q")).toContain("created:>=");
  expect(url.searchParams.get("per_page")).toBe("30");
  expect(fetch.mock.calls[0][1].redirect).toBe("error");
});
it("não aceita injeção de qualificadores nem destino externo nos termos", async () => {
  const fetch = mockIssues([]);
  await searchJobs({ ...filters, q: 'repo:private/data is:closed " OR', source: "Frontend BR" });
  const q = (fetch.mock.calls[0][0] as URL).searchParams.get("q")!;
  expect(q).not.toContain("repo:private/data");
  expect(q).not.toContain("is:closed");
  expect(q).not.toContain("repo:backend-br/vagas");
  expect(q).toContain('"OR" "Remoto" repo:frontendbr/vagas is:issue is:open');
});
it("descarta links adulterados, issues fechadas, pull requests e payloads inválidos", async () => {
  mockIssues([
    issue,
    { ...issue, html_url: "https://github.com.evil.test/backend-br/vagas/issues/1" },
    { ...issue, html_url: "javascript:alert(1)" },
    { ...issue, html_url: "https://github.com/private/data/issues/1" },
    { ...issue, state: "closed" },
    { ...issue, pull_request: { url: "https://api.github.com/pulls/1" } },
    { ...issue, created_at: "inválida" },
  ]);
  expect((await searchJobs(filters)).items).toHaveLength(1);
});
it("distingue busca vazia, resultado parcial e falha da fonte", async () => {
  mockIssues([], true);
  expect(await searchJobs(filters)).toMatchObject({ items: [], total: 0, incomplete: true });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 403 })));
  await expect(searchJobs(filters)).rejects.toThrow();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  await expect(searchJobs(filters)).rejects.toThrow();
});
it("registra a confirmação uma vez, preserva a data em entrevistas e aceita backups antigos", () => {
  expect(parseBackup(JSON.stringify({ ...emptyData(), jobs: [job] })).jobs).toEqual([job]);
  const at = "2026-11-02T15:00:00.000Z";
  const sent = changeJobStatus(job, "Candidatura enviada", at);
  expect(sent.appliedAt).toBe(at);
  expect(changeJobStatus(sent, "Candidatura enviada").appliedAt).toBe(at);
  expect(changeJobStatus(sent, "Entrevista").appliedAt).toBe(at);
  expect(changeJobStatus(sent, "Encontrada").appliedAt).toBeNull();
  expect(changeJobStatus(job, "Rejeitada").appliedAt).toBeNull();
  expect(parseBackup(JSON.stringify({ ...emptyData(), jobs: [sent] })).jobs[0].appliedAt).toBe(at);
});

function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
}
async function call(query: Record<string, unknown>, method = "GET") {
  const res = response();
  await handler({ method, query } as unknown as ApiRequest, res as unknown as ApiResponse);
  return res;
}
it("valida método e filtros antes de chamar a fonte", async () => {
  const fetch = mockIssues([]);
  expect((await call({}, "POST")).status).toHaveBeenCalledWith(405);
  for (const query of [{ q: ["Java"] }, { q: "x".repeat(101) }, { location: "x".repeat(61) }, { source: "https://evil.test" }])
    expect((await call(query)).status).toHaveBeenCalledWith(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("retorna cache público apenas para vagas públicas e não disfarça falhas de resultado vazio", async () => {
  mockIssues([issue]);
  const res = await call({});
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "public, s-maxage=900, stale-while-revalidate=900");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 429 })));
  const failed = await call({});
  expect(failed.status).toHaveBeenCalledWith(503);
  expect(failed.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  expect(failed.json).toHaveBeenCalledWith({ error: expect.stringContaining("limite") });
});
