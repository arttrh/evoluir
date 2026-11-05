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

export async function searchGupyJobs() {
  // shortcut: contrato observado no portal público, rever o parser se a Gupy mudar sua busca.
  const response = await fetch("https://portal.gupy.io/api/job-search/jobs?jobName=java&limit=100&offset=0", {
    headers: { Accept: "application/json", "User-Agent": "evoluir-job-alerts" },
    redirect: "error", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("A busca pública da Gupy está indisponível.");
  const result = z.object({ data: z.array(z.unknown()).max(100), pagination: z.object({ total: z.number().int().nonnegative() }) })
    .parse(JSON.parse(await readBounded(response, 3_000_000)));
  return result.data.flatMap(item => {
    const parsed = publicJob.safeParse(item);
    if (!parsed.success) return [];
    const job = parsed.data;
    if (job.applicationDeadline && Date.parse(job.applicationDeadline) < Date.now()) return [];
    return [gupyVacancySchema.parse({ title: job.name.slice(0, 180), url: job.jobUrl, source: "Gupy",
      description: job.description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").slice(0, 12000),
      publishedAt: job.publishedDate, labels: [],
    })];
  });
}
