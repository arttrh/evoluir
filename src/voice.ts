import { type Task } from "./model";
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
  quinze: "15",
  vinte: "20",
  trinta: "30",
  quarenta: "40",
  cinquenta: "50",
  sessenta: "60",
};
export type VoiceIntent =
  | { kind: "run"; distance: number; seconds: number }
  | { kind: "complete"; taskIds: string[]; query: string }
  | { kind: "unknown"; reason: string };
export function parseCommand(raw: string, tasks: Task[]): VoiceIntent {
  if (/-\s*\d|\bmenos\b/.test(normalize(raw)) || /-\s*\d/.test(raw))
    return {
      kind: "unknown",
      reason:
        "Distância e duração precisam ser positivas. Nenhuma ação foi realizada.",
    };
  const value = normalize(raw)
    .replace(
      /\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta|quarenta|cinquenta|sessenta)\b/g,
      (s) => words[s],
    )
    .replace(/\b(\d{2}) e (\d)\b/g, (_, a, b) => String(Number(a) + Number(b)))
    .replace(/\b(\d+) e mei[oa]\b/g, (_, n) => String(Number(n) + 0.5));
  if (/\b(corri|corrida|correr)\b/.test(value)) {
    const distance = value.match(
      /(\d+(?:[.,]\d+)?)\s*(?:km|quilometros?|kilometros?)\b/,
    );
    const minutes = value.match(/(\d+(?:[.,]\d+)?)\s*(?:minutos?|min)\b/);
    const hours = value.match(/(\d+(?:[.,]\d+)?)\s*(?:horas?|h)\b/);
    const km = distance ? Number(distance[1].replace(",", ".")) : 0;
    const seconds = Math.round(
      ((minutes ? Number(minutes[1].replace(",", ".")) : 0) +
        (hours ? Number(hours[1].replace(",", ".")) * 60 : 0)) *
        60,
    );
    if (km > 0 && km <= 500 && seconds > 0 && seconds <= 604800)
      return { kind: "run", distance: km, seconds };
    return {
      kind: "unknown",
      reason:
        "Diga a distância e o tempo. Por exemplo: “Corri 5 quilômetros em 35 minutos”.",
    };
  }
  if (
    /\b(terminei|conclui|concluir|finalizei|completei|marcar|riscar)\b/.test(
      value,
    )
  ) {
    const query = value
      .replace(
        /\b(terminei|conclui|concluir|finalizei|completei|marcar|riscar|de|a|o|tarefa|como|concluida|feito|feita)\b/g,
        " ",
      )
      .trim();
    const tokens = query.split(/\s+/).filter((s) => s.length > 1);
    const matches = tokens.length
      ? tasks.filter(
          (t) =>
            t.status === "pendente" &&
            tokens.every((token) =>
              normalize(t.title).split(/\s+/).includes(token),
            ),
        )
      : [];
    if (matches.length)
      return { kind: "complete", taskIds: matches.map((t) => t.id), query };
    return {
      kind: "unknown",
      reason:
        "Não encontrei uma tarefa pendente com esse nome. Diga “Concluí” e o título da tarefa.",
    };
  }
  return {
    kind: "unknown",
    reason:
      "Use “Concluí revisar currículo” ou “Corri 5 quilômetros em 35 minutos”. Nenhuma ação foi realizada.",
  };
}
