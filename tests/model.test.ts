import { describe, it, expect } from "vitest";
import {
  saveRun,
  addDays,
  dataSchema,
  emptyData,
  monday,
  pace,
  parseBackup,
  today,
  trackProgress,
  transitionTask,
  type Task,
} from "../src/model";
import { createTrack, templateNames } from "../src/catalog";
const task: Task = {
  id: "task-1",
  title: "Estudar Java",
  area: "estudos",
  date: "2026-11-02",
  minutes: 30,
  status: "pendente",
  completedAt: null,
  history: [],
  goalId: null,
};
describe("datas e planejamento", () => {
  it("usa dias locais e atravessa mês e ano sem deslocar a data", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(monday("2026-11-01")).toBe("2026-10-26");
    expect(today(new Date(2026, 10, 2, 0, 1))).toBe("2026-11-02");
  });
  it("reagenda sem apagar o evento anterior", () => {
    const moved = transitionTask(task, "reagendada", "2026-11-03");
    const again = transitionTask(moved, "reagendada", "2026-11-04");
    expect(again.date).toBe("2026-11-04");
    expect(again.history.map((h) => [h.from, h.to])).toEqual([
      ["2026-11-02", "2026-11-03"],
      ["2026-11-03", "2026-11-04"],
    ]);
    expect(task.history).toHaveLength(0);
  });
  it("conclui, reabre e pula mantendo histórico e consistência", () => {
    const done = transitionTask(
      task,
      "concluída",
      task.date,
      "2026-11-02T12:00:00.000Z",
    );
    expect(done.completedAt).toBe("2026-11-02T12:00:00.000Z");
    const reopened = transitionTask(done, "reaberta");
    expect(reopened.completedAt).toBeNull();
    expect(reopened.status).toBe("pendente");
    expect(transitionTask(reopened, "pulada").history).toHaveLength(3);
  });
  it("recusa datas inexistentes", () => {
    expect(() => transitionTask(task, "reagendada", "2026-02-30")).toThrow();
  });
});
describe("corrida", () => {
  it("calcula e arredonda ritmo com transporte de segundos", () => {
    expect(pace(1930, 5)).toBe("6:26");
    expect(pace(359.9, 1)).toBe("6:00");
    expect(pace(20, 0)).toBe("—");
  });
  it("recusa distância zero, valores negativos e infinitos", () => {
    for (const distance of [0, -1, Infinity])
      expect(() =>
        dataSchema.parse({
          ...emptyData(),
          runs: [
            {
              id: "r",
              date: "2026-11-02",
              distance,
              seconds: 30,
              notes: "",
              taskId: null,
            },
          ],
        }),
      ).toThrow();
  });
});
describe("backup e trilhas", () => {
  it("restaura um backup válido sem descartar registros", () => {
    const data = { ...emptyData(), tasks: [task] };
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
  });
  it("recusa JSON inválido, versões desconhecidas e conteúdo excessivo", () => {
    for (const input of [
      "{",
      JSON.stringify({ ...emptyData(), version: 2 }),
      " ".repeat(2_000_001),
    ])
      expect(() => parseBackup(input)).toThrow();
  });
  it("recusa links executáveis dentro do backup", () => {
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...emptyData(),
          jobs: [
            {
              id: "j",
              company: "Teste",
              role: "Java",
              date: "2026-11-02",
              status: "Encontrada",
              contact: "",
              notes: "",
              url: "javascript:alert(1)",
            },
          ],
        }),
      ),
    ).toThrow();
  });
  it.each(templateNames)(
    "modelo %s tem exercícios, critérios e fontes contextualizadas",
    (name) => {
      const track = createTrack(name, name);
      expect(() =>
        dataSchema.parse({ ...emptyData(), tracks: [track] }),
      ).not.toThrow();
      expect(trackProgress(track).done).toBe(0);
      for (const t of track.modules.flatMap((m) => m.topics)) {
        expect(t.criteria.length).toBeGreaterThan(15);
        expect(t.exercise.length).toBeGreaterThan(15);
        expect(
          t.resources.every(
            (r) => r.why.length > 15 && r.url.startsWith("https://"),
          ),
        ).toBe(true);
      }
    },
  );
  it("cria cópias independentes das trilhas", () => {
    const a = createTrack("Java", "Java"),
      b = createTrack("Java", "Java");
    expect(a.modules[0].topics[0].id).not.toBe(b.modules[0].topics[0].id);
  });
});

describe("integridade dos registros", () => {
  it("recusa IDs duplicados e vínculos ausentes", () => {
    expect(() =>
      dataSchema.parse({ ...emptyData(), tasks: [task, task] }),
    ).toThrow();
    expect(() =>
      dataSchema.parse({
        ...emptyData(),
        tasks: [{ ...task, goalId: "inexistente" }],
      }),
    ).toThrow();
  });
  it("registra a mudança de data quando uma corrida conclui um treino", () => {
    const result = saveRun(
      { ...emptyData(), tasks: [{ ...task, area: "corpo" }] },
      {
        id: "run-1",
        date: "2026-11-03",
        distance: 5,
        seconds: 1800,
        notes: "",
        taskId: task.id,
      },
    );
    expect(result.tasks[0].history.map((h) => h.action)).toEqual([
      "reagendada",
      "concluída",
    ]);
    expect(result.tasks[0].history[0].from).toBe("2026-11-02");
    expect(result.tasks[0].date).toBe("2026-11-03");
    expect(() => dataSchema.parse(result)).not.toThrow();
  });
  it("recusa duas corridas vinculadas ao mesmo treino", () => {
    const run = {
      id: "run-1",
      date: task.date,
      distance: 5,
      seconds: 1800,
      notes: "",
      taskId: task.id,
    };
    const data = saveRun(
      { ...emptyData(), tasks: [{ ...task, area: "corpo" }] },
      run,
    );
    expect(() => saveRun(data, { ...run, id: "run-2" })).toThrow();
  });
});

describe("objetivo de estudo", () => {
  it.each([
    ["Quero melhorar Java", "JDK"],
    ["Quero estudar Spring Cloud", "Configurar"],
    ["Quero aprender Docker", "containers"],
    ["Quero aprender arquitetura de software", "Qualidades"],
  ])("seleciona o modelo pelo objetivo: %s", (title, topic) => {
    expect(createTrack(title, "auto").modules[0].topics[0].title).toContain(
      topic,
    );
  });
  it("não confunde JavaScript com Java e mantém tema desconhecido manual", () => {
    expect(
      createTrack("Aprender JavaScript", "auto").modules[0].topics[0].title,
    ).toContain("Tipos, funções");
    expect(createTrack("Aprender Elixir", "auto").modules[0].title).toBe(
      "Primeiro módulo",
    );
  });
});
