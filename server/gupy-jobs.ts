import { z } from "zod";
import { vacancySchema } from "../src/jobs.js";
import { readBounded } from "./http.js";

const jobUrl = z.string().max(2000).refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^[a-z0-9][a-z0-9-]*\.gupy\.io$/.test(url.hostname)
      && !url.username && !url.password && !url.port && !url.hash
      && (/^\/jobs\/[1-9]\d*$/.test(url.pathname) || /^\/job\/[A-Za-z0-9_=+-]+$/.test(url.pathname))
      && [...url.searchParams.keys()].every(key => key === "jobBoardSource");
  } catch { return false; }
});
export const gupyVacancySchema = vacancySchema.extend({ url: jobUrl, source: z.literal("Gupy") });
export type GupyVacancy = z.infer<typeof gupyVacancySchema>;
const publicJob = z.object({
  name: z.string().min(1).max(10000), jobUrl,
  description: z.string().max(100000), publishedDate: z.string().datetime(),
  applicationDeadline: z.string().datetime().nullable().optional(),
});

// A busca da Gupy só procura no título e devolve no máximo 100 itens por consulta; uma consulta única ("java")
// deixava de fora vagas de estágio e júnior cujo título não cita Java. Cada termo traz as mais recentes primeiro.
export const gupyQueries = ["java", "java junior", "java jr", "java estágio", "estágio desenvolvimento", "estágio ti",
  "estágio software", "desenvolvedor junior", "desenvolvedor java", "backend"];
const maximumAgeDays = 60;

async function searchGupyQuery(query: string) {
  // shortcut: contrato observado no portal público, rever o parser se a Gupy mudar sua busca.
  const params = new URLSearchParams({ jobName: query, limit: "100", offset: "0", sortBy: "publishedDate", sortOrder: "desc" });
  const response = await fetch(`https://portal.gupy.io/api/job-search/jobs?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "evoluir-job-alerts" },
    redirect: "error", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("A busca pública da Gupy está indisponível.");
  return z.object({ data: z.array(z.unknown()).max(100), pagination: z.object({ total: z.number().int().nonnegative() }) })
    .parse(JSON.parse(await readBounded(response, 3_000_000))).data;
}

export async function searchGupyJobs(queries = gupyQueries, now = Date.now()) {
  const found = new Map<string, GupyVacancy>();
  let failures = 0;
  for (const query of queries) {
    let items: unknown[];
    try { items = await searchGupyQuery(query); } catch { failures++; continue; }
    for (const item of items) {
      const parsed = publicJob.safeParse(item);
      if (!parsed.success) continue;
      const job = parsed.data;
      if (job.applicationDeadline && Date.parse(job.applicationDeadline) < now) continue;
      if (now - Date.parse(job.publishedDate) > maximumAgeDays * 86400000) continue;
      found.set(job.jobUrl, gupyVacancySchema.parse({ title: job.name.slice(0, 180), url: job.jobUrl, source: "Gupy",
        description: job.description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").slice(0, 12000),
        publishedAt: job.publishedDate, labels: [],
      }));
    }
  }
  // Falha total não pode parecer "nenhuma vaga nova".
  if (failures === queries.length) throw new Error("A busca pública da Gupy está indisponível.");
  return [...found.values()];
}
