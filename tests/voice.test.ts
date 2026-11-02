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
