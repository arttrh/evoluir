import { uid, type Track } from "./model.js";
import { advancedTracks } from "./advanced-content.js";
import { deepTracks } from "./deep-tracks.js";
import { readyTracks } from "./ready-content.js";
const seeds: typeof advancedTracks = {
  ...advancedTracks,
  ...readyTracks,
  ...deepTracks,
};
export const templateMatchers = [
  ["Go", /\b(go|golang|golengue|golink)\b|go lang/],
  ["Python", /\bpython\b/],
  ["React", /\breact\b/],
  ["Node.js", /\bnode(?:\.js|js)?\b/],
  ["TypeScript", /\btype[\s-]*script\b/],
  ["JavaScript", /\bjava[\s-]*script\b/],
  ["Rust", /\brust\b/],
  ["C# / .NET", /c#|c sharp|csharp|\.net|dotnet/],
  ["SQL / PostgreSQL", /\b(sql|postgresql|postgres|mysql)\b/],
  ["Git", /\bgit\b/],
  ["Linux", /\blinux\b/],
  ["Kubernetes", /\b(kubernetes|k8s)\b/],
  [
    "Segurança de aplicações",
    /seguranca|security|owasp|appsec|ciberseguranca/,
  ],
  [
    "Spring Boot",
    /spring[\s-]*boot|spring[\s-]*framework|spring[\s-]*security/,
  ],
  ["AWS / Cloud", /\b(aws|cloud|nuvem)\b/],
  [
    "System Design",
    /system[\s-]*design|projeto de sistemas|sistemas distribuidos/,
  ],
  [
    "Arquitetura de software",
    /arquitetura|software architect|clean architecture|hexagonal/,
  ],
  ["Spring Cloud", /spring[\s-]*cloud/],
  ["Docker", /\bdocker\b/],
  ["Java", /\bjava\b/],
  ["Backend", /back[\s-]*end/],
] as const;
export function templateFor(title: string) {
  const subject = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Spring Cloud tem prioridade sobre a expressão genérica de nuvem.
  if (/spring[\s-]*cloud/.test(subject)) return "Spring Cloud";
  if (
    /\bjava\b/.test(subject) &&
    /spring[\s-]*(boot|framework|security)/.test(subject)
  )
    return "Java";
  return templateMatchers.find(([, pattern]) => pattern.test(subject))?.[0] || "manual";
}

export const templateNames = Object.keys(seeds);
export function createTrack(title: string, template: string): Track {
  const suggested = templateFor(title);
  const seed = seeds[template === "auto" ? suggested : template];
  return {
    id: uid(),
    title,
    objective: seed?.objective || `Organizar o aprendizado de ${title}.`,
    prerequisites:
      seed?.prerequisites || "Informe os conhecimentos necessários.",
    modules: (
      seed?.modules || [
        {
          title: "Primeiro módulo",
          topics: [
            {
              title: "Definir fundamentos",
              criteria:
                "Defina o que você conseguirá fazer ao concluir este tópico.",
              exercise: "Adicione um exercício pequeno e verificável.",
              resources: [],
            },
          ],
        },
      ]
    ).map((m) => ({
      ...m,
      id: uid(),
      topics: m.topics.map((t) => ({
        ...t,
        id: uid(),
        done: false,
        reviewDate: null,
        reviewed: false,
      })),
    })),
  };
}

export function expandTrack(track: Track): Track {
  if (templateFor(track.title) === "manual") return track;
  const full = createTrack(track.title, "auto");
  const key = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const moduleKey = (s: string) =>
    key(
      s.replace(
        /^(Básico|Intermediário|Avançado|Projeto final)( opcional)?\s*·\s*/i,
        "",
      ),
    );
  const oldTopics = track.modules.flatMap((m) => m.topics);
  const consumed = new Set<string>();
  const modules = full.modules.map((module) => {
    const previous = track.modules.find(
      (m) => moduleKey(m.title) === moduleKey(module.title),
    );
    const id = previous?.id || module.id;
    return {
      ...module,
      id,
      topics: module.topics.map((topic) => {
        const old = oldTopics.find(
          (t) => !consumed.has(t.id) && key(t.title) === key(topic.title),
        );
        if (!old) return topic;
        consumed.add(old.id);
        const resources = [...old.resources];
        for (const r of topic.resources)
          if (
            !resources.some((saved) => saved.url === r.url) &&
            resources.length < 20
          )
            resources.push(r);
        return { ...old, resources };
      }),
    };
  });
  for (const oldModule of track.modules) {
    const topics = oldModule.topics.filter((t) => !consumed.has(t.id));
    if (!topics.length) continue;
    const target = modules.find((m) => m.id === oldModule.id);
    if (target) target.topics.push(...topics);
    else {
      modules.push({ ...oldModule, topics });
    }
  }
  return { ...track, modules };
}

export function hasExpansion(track: Track) {
  const key = templateFor(track.title);
  if (key === "manual") return false;
  const names = new Set(
    track.modules.flatMap((m) => m.topics.map((t) => t.title.toLowerCase())),
  );
  return seeds[key].modules.some((m) =>
    m.topics.some((t) => !names.has(t.title.toLowerCase())),
  );
}
