import { afterEach, expect, it, vi } from "vitest";
import { gupyVacancySchema, searchGupyJobs } from "../server/gupy-jobs";

const job = { name: "Java Júnior", jobUrl: "https://empresa.gupy.io/job/abc123=?jobBoardSource=gupy_portal",
  description: "<p>Java e Spring</p>", publishedDate: new Date().toISOString(), applicationDeadline: null };
afterEach(() => vi.unstubAllGlobals());
function results(data: unknown[]) {
  const fetch = vi.fn().mockResolvedValue(Response.json({ data, pagination: { total: data.length } }));
  vi.stubGlobal("fetch", fetch); return fetch;
}
it("consulta o portal público sem credencial ou sessão do candidato", async () => {
  const fetch = results([job]);
  const items = await searchGupyJobs();
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ source: "Gupy", title: "Java Júnior", url: job.jobUrl });
  expect(items[0].description).not.toContain("<p>");
  expect(fetch).toHaveBeenCalledWith("https://portal.gupy.io/api/job-search/jobs?jobName=java&limit=100&offset=0&sortBy=publishedDate&sortOrder=desc",
    expect.objectContaining({ redirect: "error", headers: { Accept: "application/json", "User-Agent": "evoluir-job-alerts" } }));
});
it("consulta vários termos, junta sem duplicar e descarta anúncios antigos", async () => {
  const now = Date.parse("2026-11-11T12:00:00.000Z");
  const estagio = { ...job, name: "Estágio em Desenvolvimento", jobUrl: "https://outra.gupy.io/jobs/7", publishedDate: "2026-11-10T00:00:00.000Z" };
  const antiga = { ...job, name: "Java Jr antiga", jobUrl: "https://velha.gupy.io/jobs/8", publishedDate: "2026-07-01T00:00:00.000Z" };
  const fetch = vi.fn()
    .mockResolvedValueOnce(Response.json({ data: [{ ...job, publishedDate: "2026-11-09T00:00:00.000Z" }, antiga], pagination: { total: 2 } }))
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValueOnce(Response.json({ data: [estagio, { ...job, publishedDate: "2026-11-09T00:00:00.000Z" }], pagination: { total: 2 } }));
  vi.stubGlobal("fetch", fetch);
  const items = await searchGupyJobs(["java", "java junior", "estágio desenvolvimento"], now);
  expect(items.map(item => item.title).sort()).toEqual(["Estágio em Desenvolvimento", "Java Júnior"]);
  expect(fetch).toHaveBeenCalledTimes(3);
});
it("descarta anúncios vencidos, dados inválidos e destinos fora da Gupy", async () => {
  results([job,
    { ...job, applicationDeadline: "2000-01-01T00:00:00.000Z" },
    { ...job, publishedDate: "inválido" },
    { ...job, jobUrl: "https://empresa.gupy.io.evil.example/jobs/12" },
    { ...job, jobUrl: "https://evil.example/jobs/12" },
    { ...job, jobUrl: "https://user:password@empresa.gupy.io/jobs/12" },
    { ...job, jobUrl: "https://empresa.gupy.io/job/abc?redirect=https://evil.example" },
  ]);
  expect(await searchGupyJobs()).toHaveLength(1);
});
it("aceita somente páginas de vaga HTTPS da Gupy", () => {
  const vacancy = { title: job.name, url: "https://empresa.gupy.io/jobs/123", publishedAt: job.publishedDate,
    source: "Gupy", description: "Java", labels: [] };
  expect(gupyVacancySchema.safeParse(vacancy).success).toBe(true);
  expect(gupyVacancySchema.safeParse({ ...vacancy, url: "http://empresa.gupy.io/jobs/123" }).success).toBe(false);
});
it("falha da fonte não é apresentada como busca vazia", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
  await expect(searchGupyJobs()).rejects.toThrow("indisponível");
});
