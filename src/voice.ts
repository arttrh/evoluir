import { type Task, type Track } from "./model";
import { templateFor } from "./catalog";
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(
      /\bspring[\s-]*(cloud|boot|security|framework|data)\b/g,
      "spring $1",
    )
    .replace(/\bjava[\s-]+script\b/g, "javascript")
    .replace(/\btype[\s-]+script\b/g, "typescript")
    .replace(/[^a-z0-9\s.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const words: Record<string, string> = {
  um: "1",
  uma: "1",
  dois: "2",
  duas: "2",
  tres: "3",
  quatro: "4",
  cinco: "5",
  seis: "6",
  sete: "7",
  oito: "8",
  nove: "9",
  dez: "10",
  onze: "11",
  doze: "12",
  treze: "13",
  catorze: "14",
  quatorze: "14",
  quinze: "15",
  dezesseis: "16",
  dezasseis: "16",
  dezessete: "17",
  dezoito: "18",
  dezenove: "19",
  vinte: "20",
  trinta: "30",
  quarenta: "40",
  cinquenta: "50",
  sessenta: "60",
  setenta: "70",
  oitenta: "80",
  noventa: "90",
  cem: "100",
};
const aliases: Record<string, string> = {
  estudei: "estudar",
  estudando: "estudar",
  estudo: "estudar",
  estudos: "estudar",
  enviei: "enviar",
  enviadas: "enviar",
  enviados: "enviar",
  enviando: "enviar",
  candidaturas: "candidatura",
  candidatei: "candidatura",
  revisei: "revisar",
  revisando: "revisar",
  revisao: "revisar",
  resolvi: "resolver",
  resolvendo: "resolver",
  exercicios: "exercicio",
  pratiquei: "praticar",
  praticando: "praticar",
  implementei: "implementar",
  implementando: "implementar",
  procurei: "procurar",
  vagas: "vaga",
};
const ignored = new Set([
  "eu",
  "ja",
  "hoje",
  "agora",
  "a",
  "o",
  "as",
  "os",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "um",
  "uma",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "para",
  "por",
  "com",
  "essa",
  "esse",
  "esta",
  "este",
  "minha",
  "meu",
  "tarefa",
  "topico",
  "modulo",
  "parte",
  "sessao",
  "estudos",
  "emprego",
  "carreira",
  "terminei",
  "conclui",
  "concluir",
  "finalizei",
  "completei",
  "acabei",
  "marcar",
  "riscar",
  "como",
  "concluida",
  "concluido",
  "feito",
  "feita",
  "foi",
  "sobre",
  "aula",
  "aulas",
  "assunto",
  "curso",
  "trilha",
  "ontem",
  "minuto",
  "minutos",
  "min",
  "hora",
  "horas",
  "aprendi",
  "li",
  "assisti",
  "aprender",
]);
function tokens(s: string) {
  return normalize(s)
    .split(/[\s.,]+/)
    .filter((t) => t.length > 1 && !ignored.has(t) && !/^\d+$/.test(t))
    .map((t) => aliases[t] || t);
}
export type VoiceIntent =
  | { kind: "run"; distance: number; seconds: number }
  | { kind: "complete"; taskIds: string[]; query: string }
  | {
      kind: "study";
      topicIds: string[];
      query: string;
      suggestedTopicId?: string;
      courseTitle?: string;
    }
  | { kind: "unknown"; reason: string };
export function parseCommand(
  raw: string,
  tasks: Task[],
  tracks: Track[] = [],
): VoiceIntent {
  const normalized = normalize(raw);
  if (/\b(nao|nunca|quase|vou|pretendo)\b/.test(normalized))
    return {
      kind: "unknown",
      reason:
        "Não vou concluir algo que você disse que ainda não fez. Edite a frase para informar a ação realizada.",
    };
  if (/-\s*\d/.test(raw) || /\bmenos\b/.test(normalized))
    return {
      kind: "unknown",
      reason:
        "Distância e duração precisam ser positivas. Nenhuma ação foi realizada.",
    };
  const value = normalized
    .replace(/\bmeia hora\b/g, "0.5 hora")
    .replace(
      /\b(?:um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezasseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem)\b/g,
      (s) => words[s],
    )
    .replace(/\b(\d{2}) e (\d)\b/g, (_, a, b) => String(Number(a) + Number(b)))
    .replace(/\b(\d+) virgula (\d+)\b/g, "$1.$2")
    .replace(/\b(\d+) e mei[oa]\b/g, (_, n) => String(Number(n) + 0.5))
    .replace(
      /\b(\d+)\s*(quilometros?|kilometros?|km) e meio\b/g,
      (_, n, unit) => `${Number(n) + 0.5} ${unit}`,
    );
  if (/\b(corri|corrida|correr)\b/.test(value)) {
    const distance = value.match(
      /(\d+(?:[.,]\d+)?)\s*(?:km|quilometros?|kilometros?)\b/,
    );
    const minutes = value.match(/(\d+(?:[.,]\d+)?)\s*(?:minutos?|min)\b/);
    const hours = value.match(/(\d+(?:[.,]\d+)?)\s*(?:horas?|h)\b/);
    const seconds = value.match(/(\d+(?:[.,]\d+)?)\s*(?:segundos?|seg|s)\b/);
    const km = distance ? Number(distance[1].replace(",", ".")) : 0;
    const duration = Math.round(
      (minutes ? Number(minutes[1].replace(",", ".")) * 60 : 0) +
        (hours ? Number(hours[1].replace(",", ".")) * 3600 : 0) +
        (seconds ? Number(seconds[1].replace(",", ".")) : 0),
    );
    if (km > 0 && km <= 500 && duration > 0 && duration <= 604800)
      return { kind: "run", distance: km, seconds: duration };
    return {
      kind: "unknown",
      reason:
        "Diga a distância e o tempo. Por exemplo: “Corri 5 quilômetros em 35 minutos”.",
    };
  }
  if (
    /\b(terminei|conclui|concluir|finalizei|completei|acabei|marcar|riscar|estudei|aprendi|li|assisti|enviei|revisei|resolvi|pratiquei|implementei|candidatei|procurei)\b/.test(
      value,
    )
  ) {
    const queryTokens = tokens(value);
    const matches = (title: string, topic = false) => {
      const titleTokens = tokens(title);
      const query = topic
        ? queryTokens.filter((t) => t !== "estudar")
        : queryTokens;
      return query.length > 0 && query.every((t) => titleTokens.includes(t));
    };
    const found = tasks.filter(
      (t) => t.status === "pendente" && matches(t.title),
    );
    if (found.length)
      return { kind: "complete", taskIds: found.map((t) => t.id), query: raw };
    const studyTokens = queryTokens.filter((t) => t !== "estudar");
    const spokenKey = templateFor(raw);
    const scopes = tracks.filter((track) => {
      const names = tokens(track.title).filter((t) => t !== "estudar");
      return (
        (names.length > 0 && names.every((t) => studyTokens.includes(t))) ||
        (spokenKey !== "manual" && templateFor(track.title) === spokenKey)
      );
    });
    if (
      scopes.length &&
      /\b(estudei|estudar|estudo|aprendi|li|assisti|topico|modulo|terminei|conclui|completei|finalizei|acabei)\b/.test(
        value,
      )
    ) {
      const exactTopics: string[] = [];
      const moduleTopics: string[] = [];
      const referenceTopics: string[] = [];
      let courseOnly = false;
      for (const track of scopes) {
        const key = templateFor(track.title);
        const scopeWords = new Set([
          ...tokens(track.title),
          ...tokens(key),
          ...(key === "Spring Cloud"
            ? ["springcloud"]
            : key === "Spring Boot"
              ? ["springboot"]
              : key === "Go"
                ? ["go", "golang", "golengue", "golink"]
                : []),
        ]);
        const remaining = studyTokens.filter((t) => !scopeWords.has(t));
        if (!remaining.length) courseOnly = true;
        for (const module of track.modules) {
          const moduleWords = tokens(module.title);
          for (const topic of module.topics) {
            const words = tokens(topic.title);
            if (topic.done) continue;
            if (!remaining.length || remaining.every((t) => words.includes(t)))
              exactTopics.push(topic.id);
            else if (
              remaining.every((t) =>
                tokens(
                  topic.resources.map((r) => new URL(r.url).pathname).join(" "),
                ).includes(t),
              )
            )
              referenceTopics.push(topic.id);
            else if (remaining.every((t) => moduleWords.includes(t)))
              moduleTopics.push(topic.id);
          }
        }
      }
      const selectedTopics = exactTopics.length
        ? exactTopics
        : referenceTopics.length
          ? referenceTopics
          : moduleTopics;
      if (selectedTopics.length)
        return {
          kind: "study",
          topicIds: selectedTopics,
          query: raw,
          ...(courseOnly && scopes.length === 1
            ? {
                suggestedTopicId: selectedTopics[0],
                courseTitle: scopes[0].title,
              }
            : {}),
        };
      return {
        kind: "unknown",
        reason:
          "Não há um tópico pendente correspondente nesta trilha. Confira o nome ou consulte as revisões dos tópicos já concluídos.",
      };
    }
    const topics = tracks
      .flatMap((t) => t.modules.flatMap((m) => m.topics))
      .filter((t) => !t.done && matches(t.title, true));
    if (topics.length)
      return { kind: "study", topicIds: topics.map((t) => t.id), query: raw };
    const references = tracks
      .flatMap((t) => t.modules.flatMap((m) => m.topics))
      .filter(
        (topic) =>
          !topic.done &&
          studyTokens.length > 0 &&
          studyTokens.every((word) =>
            tokens(
              topic.resources.map((r) => new URL(r.url).pathname).join(" "),
            ).includes(word),
          ),
      );
    if (references.length)
      return {
        kind: "study",
        topicIds: references.map((t) => t.id),
        query: raw,
      };
    return {
      kind: "unknown",
      reason:
        "Não encontrei uma tarefa ou tópico pendente com esse nome. Confira a transcrição e use o título que aparece no app.",
    };
  }
  return {
    kind: "unknown",
    reason:
      "Use “Terminei de estudar Java”, “Enviei as candidaturas” ou “Corri 5 quilômetros em 35 minutos”. Nenhuma ação foi realizada.",
  };
}
