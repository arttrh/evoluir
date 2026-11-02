import { z } from "zod";
import { jobSearchSchema, vacanciesSchema, vacancySchema, type JobSearch } from "../src/jobs.js";

const repositories: Record<string, string> = {
  "Backend BR": "backend-br/vagas",
  "Frontend BR": "frontendbr/vagas",
};
const issueSchema = z.object({
  title: z.string().min(1),
  html_url: z.string(),
  created_at: z.string().datetime(),
  body: z.string().nullable(),
  labels: z.array(z.object({ name: z.string() })),
  state: z.string(),
  pull_request: z.unknown().optional(),
});

export async function searchJobs(input: JobSearch) {
  const search = jobSearchSchema.parse(input);
  const terms = `${search.q} ${search.location}`
    .replace(/[^\p{L}\p{N}+#.\s-]/gu, " ")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word))
    .map((word) => `"${word}"`);
  const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const repos = search.source === "Todas"
    ? Object.values(repositories)
    : [repositories[search.source]];
  const url = new URL("https://api.github.com/search/issues");
  url.search = new URLSearchParams({
    q: [...terms, ...repos.map((repo) => `repo:${repo}`), "is:issue", "is:open", "in:title,body", `created:>=${since}`].join(" "),
    sort: "created", order: "desc", per_page: "30",
  }).toString();
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "evoluir-job-search" },
    signal: AbortSignal.timeout(8000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Busca de vagas indisponível.");
  const raw = await response.text();
  if (raw.length > 3_000_000) throw new Error("Resposta de vagas muito grande.");
  const result = z.object({
    items: z.array(z.unknown()).max(30),
    total_count: z.number().int().nonnegative(),
    incomplete_results: z.boolean(),
  }).parse(JSON.parse(raw));
  const items = result.items.flatMap((item) => {
    const parsed = issueSchema.safeParse(item);
    if (!parsed.success || parsed.data.state !== "open" || parsed.data.pull_request) return [];
    const issue = parsed.data;
    const source = Object.entries(repositories).find(([, repo]) =>
      issue.html_url.startsWith(`https://github.com/${repo}/issues/`),
    )?.[0];
    const vacancy = vacancySchema.safeParse({
      title: issue.title.slice(0, 180),
      url: issue.html_url,
      source,
      publishedAt: issue.created_at,
      description: (issue.body || "").slice(0, 12000),
      labels: issue.labels.slice(0, 30).map((label) => label.name.slice(0, 100)),
    });
    return vacancy.success ? [vacancy.data] : [];
  });
  return vacanciesSchema.parse({
    items, total: result.total_count, incomplete: result.incomplete_results,
    updatedAt: new Date().toISOString(),
  });
}
