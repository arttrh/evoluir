import { z } from "zod";
import { createTrack, templateFor } from "./catalog.js";
import { roadmapReferences } from "./study-content.js";
import { safeUrl, uid, type Track } from "./model.js";
export const studySourceSchema = z.object({
  title: z.string().min(1).max(500),
  url: safeUrl,
  why: z.string().max(2000),
  kind: z.enum(["official", "article", "community", "roadmap"]),
  publisher: z.string().max(100).optional(),
});
export type StudySource = z.infer<typeof studySourceSchema>;
export const studyProviders = [
  { name: "Stack Overflow", kind: "community", format: "stack", host: "stackoverflow.com", url: "https://api.stackexchange.com/2.3/search/advanced?site=stackoverflow&q={query}&pagesize=5&order=desc&sort=relevance&accepted=true&closed=false" },
  { name: "Baeldung", kind: "article", format: "feed", host: "baeldung.com", url: "https://www.baeldung.com/?s={query}&feed=rss2&orderby=relevance" },
  { name: "Medium", kind: "article", format: "feed", host: "", focusUrl: "https://medium.com/feed/tag/{focus}", url: "https://medium.com/feed/tag/{tag}" },
  { name: "DEV Community", kind: "article", format: "dev", host: "dev.to", focusUrl: "https://dev.to/api/articles?tag={focus}&per_page=30", url: "https://dev.to/api/articles?tag={devtag}&per_page=30" },
  { name: "Reddit", kind: "community", format: "feed", host: "reddit.com", url: "https://www.reddit.com/search.rss?q={query}&sort=relevance&limit=25" },
  { name: "Hacker News", kind: "community", format: "hn", host: "news.ycombinator.com", url: "https://hn.algolia.com/api/v1/search?query={query}&tags=story&hitsPerPage=5" },
] as const;
export const studyTags: Record<string, string> = {
  "Java": "java", "Spring Boot": "spring-boot", "Spring Cloud": "spring-cloud", "Go": "golang", "Python": "python",
  "JavaScript": "javascript", "TypeScript": "typescript", "React": "react", "Node.js": "nodejs", "Rust": "rust", "C# / .NET": "dotnet",
  "SQL / PostgreSQL": "postgresql", "Git": "git", "Linux": "linux", "Docker": "docker", "Kubernetes": "kubernetes",
  "Segurança de aplicações": "security", "AWS / Cloud": "aws", "System Design": "system-design", "Arquitetura de software": "software-architecture", "Backend": "backend",
};
export function studyQuery(query: string) {
  if (/^spring$/i.test(query.trim())) return "Spring Framework";
  return templateFor(query) === "Go" ? query.replace(/\b(golang|golengue|golink|go(?:\s+lang)?)\b/gi, "golang") : query;
}
export function studyTag(query: string) {
  return studyTags[templateFor(studyQuery(query))] || query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function sourcePublisher(source: StudySource) {
  return source.publisher || new URL(source.url).hostname.replace(/^www\./, "");
}
export function studySearchLinks(query: string) {
  const q=encodeURIComponent(studyQuery(query));
  return [
    {title:"Documentação oficial na web",url:`https://www.google.com/search?q=${q}+official+documentation`},
    {title:"Spring",url:`https://www.google.com/search?q=site%3Aspring.io+${q}`},
    {title:"Baeldung",url:`https://www.baeldung.com/?s=${q}`},
    {title:"Medium",url:`https://medium.com/search?q=${q}`},
    {title:"Reddit",url:`https://www.reddit.com/search/?q=${q}`},
    {title:"DEV Community",url:`https://dev.to/search?q=${q}`},
    {title:"Stack Overflow",url:`https://stackoverflow.com/search?q=${q}`},
    {title:"Hacker News",url:`https://hn.algolia.com/?q=${q}`},
  ].filter(link => link.title !== "Spring" || /spring|java/i.test(query));
}
export function officialSources(query: string): StudySource[] {
  const track = createTrack(studyQuery(query), "auto");
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const terms = normalize(query)
    .split(/\W+/)
    .filter(
      (t) =>
        t.length > 2 &&
        ![
          "spring",
          "cloud",
          "quero",
          "estudar",
          "aprender",
          "melhorar",
          "software",
        ].includes(t),
    );
  const enrich = (t: Track["modules"][number]["topics"][number]) =>
    t.resources
      .filter(
        (r) =>
          !["www.youtube.com", "youtube.com", "youtu.be"].includes(
            new URL(r.url).hostname,
          ),
      )
      .map((r) => ({
        ...r,
        why: `Para ${t.title}: ${r.why}`,
        kind: "official" as const,
      }));
  const representative = track.modules.flatMap((m) =>
    m.topics[0] ? enrich(m.topics[0]).slice(0, 1) : [],
  );
  const resources = [
    ...representative,
    ...track.modules.flatMap((m) => m.topics.flatMap(enrich)),
  ];
  const score = (r: StudySource) =>
    terms.reduce(
      (s, t) =>
        s + (normalize(`${r.title} ${r.why} ${r.url}`).includes(t) ? 1 : 0),
      0,
    );
  const seen = new Set<string>();
  return resources
    .sort((a, b) => score(b) - score(a))
    .filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    })
    .slice(0, 8);
}
export function roadmapFor(query: string) {
  const key = templateFor(query);
  return key === "manual" ? null : roadmapReferences[key];
}
export function topicModule(
  query: string,
  sources: StudySource[],
  track?: Track,
): Track["modules"][number] {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const matching =
    track?.modules.flatMap((m) =>
      normalize(m.title).includes(normalize(query))
        ? m.topics
        : m.topics.filter((t) => normalize(t.title).includes(normalize(query))),
    ) || [];
  if (matching.length)
    return {
      id: uid(),
      title: query,
      topics: matching.map((t) => ({ ...t, id: uid() })),
    };
  const relevant = sources.filter((r) =>
    normalize(`${r.title} ${r.why}`).includes(normalize(query)),
  );
  if (relevant.length) sources = relevant;
  return {
    id: uid(),
    title: query,
    topics: [
      {
        id: uid(),
        title: `Fundamentos de ${query}`.slice(0, 180),
        criteria: `Explicar os conceitos centrais de ${query} com um exemplo próprio.`,
        exercise: `Estudar a introdução da documentação e construir um exemplo mínimo de ${query}. Registrar o que funcionou e uma dúvida.`,
        done: false,
        resources: sources
          .filter((r) => r.kind !== "roadmap")
          .slice(0, 4)
          .map(({ title, url, why }) => ({
            title: title.slice(0, 180),
            url,
            why,
          })),
        reviewDate: null,
        reviewed: false,
      },
      {
        id: uid(),
        title: `Prática e revisão de ${query}`.slice(0, 180),
        criteria:
          "Executar um exemplo sem copiar o tutorial e explicar um caso de erro.",
        exercise: `Criar um pequeno projeto com ${query}, testar uma falha e documentar como executar.`,
        done: false,
        resources: sources
          .filter((r) => r.kind === "official")
          .slice(0, 2)
          .map(({ title, url, why }) => ({
            title: title.slice(0, 180),
            url,
            why,
          })),
        reviewDate: null,
        reviewed: false,
      },
    ],
  };
}
