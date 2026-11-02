import { z } from "zod";
import { createTrack } from "./catalog.js";
import { roadmapReferences } from "./study-content.js";
import { safeUrl, uid, type Track } from "./model.js";
export const studySourceSchema = z.object({
  title: z.string().min(1).max(500),
  url: safeUrl,
  why: z.string().max(2000),
  kind: z.enum(["official", "community", "roadmap"]),
});
export type StudySource = z.infer<typeof studySourceSchema>;
export function officialSources(query: string): StudySource[] {
  const track = createTrack(query, "auto");
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
    t.resources.map((r) => ({
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
  const q = query.toLowerCase();
  const key = q.includes("spring")
    ? "Spring Cloud"
    : q.includes("docker")
      ? "Docker"
      : q.includes("java") && !q.includes("javascript")
        ? "Java"
        : q.includes("arquitet")
          ? "Arquitetura de software"
          : null;
  return key ? roadmapReferences[key] : null;
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
