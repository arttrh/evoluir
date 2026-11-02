import { uid, type Track } from "./model.js";
import { springCloudModules } from "./study-content.js";
import { advancedTracks } from "./advanced-content.js";
import { readyTracks } from "./ready-content.js";
const seeds: typeof advancedTracks = {
  ...advancedTracks,
  ...readyTracks,
  "Spring Cloud": {
    objective:
      "Construir um pequeno sistema de serviços com descoberta, gateway e resiliência.",
    prerequisites:
      "Java, Spring Boot, REST, testes e configuração de aplicações.",
    modules: springCloudModules,
  },
};
export function templateFor(title: string) {
  const subject = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const match = [
    ["Go", /\b(go|golang|golengue|golink)\b|go lang/],
    ["Python", /\bpython\b/],
    ["React", /\breact\b/],
    ["Node.js", /\bnode(?:\.js|js)?\b/],
    ["TypeScript", /\btypescript\b/],
    ["JavaScript", /\bjavascript\b/],
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
  // Spring Cloud tem prioridade sobre a expressão genérica de nuvem.
  if (/spring[\s-]*cloud/.test(subject)) return "Spring Cloud";
  return match.find(([, pattern]) => pattern.test(subject))?.[0] || "manual";
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
  const full = createTrack(track.title, "auto");
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  const existingTopics = new Set(
    track.modules.flatMap((m) => m.topics.map((t) => normalize(t.title))),
  );
  const modules = full.modules
    .map((m) => ({
      ...m,
      topics: m.topics.filter((t) => !existingTopics.has(normalize(t.title))),
    }))
    .filter((m) => m.topics.length);
  return { ...track, modules: [...track.modules, ...modules] };
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
