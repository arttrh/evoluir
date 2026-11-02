import { describe, it, expect } from "vitest";
import { parseCommand } from "../src/voice";
import type { Task } from "../src/model";
const task = (id: string, title: string): Task => ({
  id,
  title,
  area: "estudos",
  date: "2026-11-02",
  minutes: 30,
  status: "pendente",
  completedAt: null,
  history: [],
  goalId: null,
});
describe("comandos de voz sem efeitos colaterais", () => {
  it.each([
    ["Corri 5 quilômetros em 35 minutos", 5, 2100],
    ["Corri cinco quilômetros em trinta e cinco minutos", 5, 2100],
    ["Corri 5,5 km em uma hora e 5 minutos", 5.5, 3900],
    ["Corri cinco e meio quilômetros em quarenta minutos", 5.5, 2400],
  ])("extrai distância e tempo: %s", (text, distance, seconds) =>
    expect(parseCommand(text, [])).toEqual({ kind: "run", distance, seconds }),
  );
  it.each([
    "Corri e bati minha meta",
    "Corri -5 km em 30 minutos",
    "Corri menos cinco km em trinta minutos",
    "Corri 5000 km em 30 minutos",
    "Apague tudo",
  ])("não inventa dados nem executa frases vagas: %s", (text) =>
    expect(parseCommand(text, []).kind).toBe("unknown"),
  );
  it("retorna candidatos e não conclui nem modifica tarefas", () => {
    const tasks = [
      task("1", "Revisar currículo"),
      task("2", "Revisar currículo para Java"),
    ];
    expect(parseCommand("Concluí revisar currículo", tasks)).toMatchObject({
      kind: "complete",
      taskIds: ["1", "2"],
    });
    expect(tasks.every((t) => t.status === "pendente")).toBe(true);
  });
  it("não confunde Java com JavaScript", () => {
    expect(
      parseCommand("Concluí estudar Java", [task("1", "Estudar JavaScript")])
        .kind,
    ).toBe("unknown");
  });
  it("ignora tarefas já concluídas", () => {
    expect(
      parseCommand("Concluí estudar Java", [
        {
          ...task("1", "Estudar Java"),
          status: "concluída",
          completedAt: new Date().toISOString(),
        },
      ]).kind,
    ).toBe("unknown");
  });
});
it.each([
  "Ainda não estudei Java",
  "Vou estudar Java",
  "Quase terminei estudar Java",
])("não conclui intenções ou negações: %s", (text) =>
  expect(parseCommand(text, [task("1", "Estudar Java")]).kind).toBe("unknown"),
);
it.each([
  ["Terminei de estudar Java", "Estudar Java"],
  ["Enviei as candidaturas", "Enviar duas candidaturas"],
  ["Revisei meu currículo", "Revisar currículo"],
  ["Resolvi o exercício prático", "Resolver exercício prático"],
])("entende conclusão natural: %s", (text, title) =>
  expect(parseCommand(text, [task("1", title)])).toMatchObject({
    kind: "complete",
    taskIds: ["1"],
  }),
);
it.each([
  ["Corri cinco vírgula cinco km em meia hora", 5.5, 1800],
  ["Corri um km e meio em quinze minutos e trinta segundos", 1.5, 930],
])("entende números naturais: %s", (text, distance, seconds) =>
  expect(parseCommand(text, [])).toEqual({ kind: "run", distance, seconds }),
);

import { createTrack } from "../src/catalog";
it.each([
  "Estudei Spring Cloud",
  "Estudei springcloud",
  "Já estudei Spring Cloud por trinta minutos",
])(
  "reconhece a trilha sem exigir tarefa diária com o mesmo título: %s",
  (text) => {
    const track = createTrack("Spring Cloud", "auto");
    const intent = parseCommand(text, [], [track]);
    expect(intent).toMatchObject({
      kind: "study",
      suggestedTopicId: track.modules[0].topics[0].id,
      courseTitle: "Spring Cloud",
    });
    expect(track.modules.flatMap((m) => m.topics).every((t) => !t.done)).toBe(
      true,
    );
  },
);
it("usa o próximo tópico pendente e não conclui uma trilha inteira", () => {
  const track = createTrack("Spring Cloud", "auto");
  track.modules[0].topics[0].done = true;
  expect(parseCommand("Estudei Spring Cloud", [], [track])).toMatchObject({
    kind: "study",
    suggestedTopicId: track.modules[0].topics[1].id,
  });
});
it.each([
  "Estudei Service Discovery de Spring Cloud",
  "Estudei Spring Cloud: Service Discovery",
])("entende assunto e contexto juntos: %s", (text) => {
  const track = createTrack("Spring Cloud", "auto");
  const expected = track.modules
    .flatMap((m) => m.topics)
    .find((t) => t.title === "Service Discovery com Eureka")!;
  expect(parseCommand(text, [], [track])).toMatchObject({
    kind: "study",
    topicIds: [expected.id],
  });
});
it("mantém escolha explícita quando duas trilhas têm o mesmo assunto", () => {
  const a = createTrack("Spring Cloud", "auto"),
    b = createTrack("Spring Cloud", "auto");
  const intent = parseCommand("Estudei Spring Cloud", [], [a, b]);
  expect(intent.kind).toBe("study");
  expect(intent).not.toHaveProperty("suggestedTopicId");
});
it.each(["Estudei GoLang", "Terminei de estudar Go", "Estudei Golengue"])(
  "entende nomes alternativos de outra tecnologia: %s",
  (text) => {
    const track = createTrack("Go", "auto");
    expect(parseCommand(text, [], [track])).toMatchObject({
      kind: "study",
      suggestedTopicId: track.modules[0].topics[0].id,
    });
  },
);
it("não troca Java por JavaScript nem registra envio como estudo", () => {
  const track = createTrack("JavaScript", "auto");
  expect(parseCommand("Estudei Java", [], [track]).kind).toBe("unknown");
  expect(parseCommand("Enviei JavaScript", [], [track]).kind).toBe("unknown");
});
it("aceita Java Script separado sem confundir com a trilha Java", () => {
  const java = createTrack("Java", "auto"),
    js = createTrack("JavaScript", "auto");
  const result = parseCommand("Estudei Java Script", [], [java, js]);
  expect(result).toMatchObject({
    kind: "study",
    courseTitle: "JavaScript",
    suggestedTopicId: js.modules[0].topics[0].id,
  });
});
it("prioriza o tópico citado em vez de todos os tópicos do módulo", () => {
  const track = createTrack("Java", "auto");
  const jdbc = track.modules
    .flatMap((m) => m.topics)
    .find((t) => t.title === "JDBC, consultas parametrizadas e transações")!;
  expect(parseCommand("Estudei JDBC de Java", [], [track])).toMatchObject({
    kind: "study",
    topicIds: [jdbc.id],
  });
});
it("usa a referência técnica para reconhecer JPA sem depender do título literal", () => {
  const track = createTrack("Java", "auto");
  const jpa = track.modules
    .flatMap((m) => m.topics)
    .find((t) => t.title === "Spring Data, paginação e consultas eficientes")!;
  expect(parseCommand("Estudei JPA", [], [track])).toMatchObject({
    kind: "study",
    topicIds: [jpa.id],
  });
  expect(parseCommand("Estudei JPA de Java", [], [track])).toMatchObject({
    kind: "study",
    topicIds: [jpa.id],
  });
});
