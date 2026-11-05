import { z } from "zod";

export function parseDecimal(value: string): number {
  const normalized = value.trim();
  if (!/^\d+(?:[,.]\d{1,3})?$/.test(normalized))
    throw new Error("Use um número como 4,1 ou 4.2, sem separador de milhares.");
  return Number(normalized.replace(",", "."));
}

export const areas = ["corpo", "estudos", "emprego"] as const;
export const jobStatuses = [
  "Encontrada",
  "Candidatura enviada",
  "Entrevista",
  "Retorno",
  "Rejeitada",
  "Contratada",
] as const;
const id = z.string().min(1).max(80);
const text = z.string().trim().min(1).max(180);
const notes = z.string().max(5000);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Data inválida");
const timestamp = z.string().datetime();
export const safeUrl = z
  .string()
  .url()
  .max(2000)
  .refine(
    (v) => ["https:", "http:"].includes(new URL(v).protocol),
    "Use um link http ou https",
  );
const eventSchema = z
  .object({
    at: timestamp,
    action: z.enum(["concluída", "reaberta", "pulada", "reagendada"]),
    from: dateSchema,
    to: dateSchema,
  })
  .strict();
export const taskSchema = z
  .object({
    id,
    title: text,
    area: z.enum(areas),
    date: dateSchema,
    minutes: z.number().int().min(1).max(1440),
    status: z.enum(["pendente", "concluída", "pulada"]),
    completedAt: timestamp.nullable(),
    history: z.array(eventSchema).max(500),
    goalId: id.nullable(),
  })
  .strict();
export const runSchema = z
  .object({
    id,
    date: dateSchema,
    distance: z.number().positive().max(500),
    seconds: z.number().int().positive().max(604800),
    notes,
    taskId: id.nullable(),
  })
  .strict();
const resourceSchema = z
  .object({ title: text, url: safeUrl, why: notes })
  .strict();
const topicSchema = z
  .object({
    id,
    title: text,
    criteria: notes,
    exercise: notes,
    done: z.boolean(),
    resources: z.array(resourceSchema).max(20),
    reviewDate: dateSchema.nullable(),
    reviewed: z.boolean(),
  })
  .strict();
const moduleSchema = z
  .object({ id, title: text, topics: z.array(topicSchema).max(100) })
  .strict();
export const trackSchema = z
  .object({
    id,
    title: text,
    objective: notes,
    prerequisites: notes,
    modules: z.array(moduleSchema).max(50),
  })
  .strict();
export const jobSchema = z
  .object({
    id,
    company: text,
    role: text,
    url: safeUrl.or(z.literal("")),
    date: dateSchema,
    status: z.enum(jobStatuses),
    appliedAt: timestamp.nullable().optional(),
    contact: z.string().max(500),
    notes,
  })
  .strict();
const goalSchema = z
  .object({
    id,
    title: text,
    area: z.enum(areas),
    deadline: dateSchema.nullable(),
    weeklyTarget: text,
    done: z.boolean(),
  })
  .strict();
export const dataSchema = z
  .object({
    version: z.literal(1),
    tasks: z.array(taskSchema).max(10000),
    runs: z.array(runSchema).max(10000),
    tracks: z.array(trackSchema).max(100),
    jobs: z.array(jobSchema).max(5000),
    goals: z.array(goalSchema).max(500),
    settings: z
      .object({
        weeklyKm: z.number().positive().max(1000),
        dailyMinutes: z.number().int().min(1).max(1440),
        dailyFocus: z.string().max(180),
      })
      .strict(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ids = new Set<string>();
    const entities = [
      ...data.tasks,
      ...data.runs,
      ...data.jobs,
      ...data.goals,
      ...data.tracks,
      ...data.tracks.flatMap((t) => t.modules),
      ...data.tracks.flatMap((t) => t.modules.flatMap((m) => m.topics)),
    ];
    for (const entity of entities) {
      if (ids.has(entity.id))
        ctx.addIssue({
          code: "custom",
          message: "Identificadores duplicados no backup.",
        });
      ids.add(entity.id);
    }
    const taskIds = new Map(data.tasks.map((t) => [t.id, t]));
    const goalIds = new Set(data.goals.map((g) => g.id));
    const runTasks = new Set<string>();
    for (const t of data.tasks) {
      if (t.goalId && !goalIds.has(t.goalId))
        ctx.addIssue({
          code: "custom",
          message: "Objetivo vinculado não encontrado.",
        });
      if ((t.status === "concluída") !== Boolean(t.completedAt))
        ctx.addIssue({
          code: "custom",
          message: "Conclusão da tarefa inconsistente.",
        });
    }
    for (const r of data.runs) {
      if (r.taskId) {
        if (taskIds.get(r.taskId)?.area !== "corpo" || runTasks.has(r.taskId))
          ctx.addIssue({
            code: "custom",
            message: "Treino vinculado inválido ou duplicado.",
          });
        runTasks.add(r.taskId);
      }
    }
  });
export type Data = z.infer<typeof dataSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Run = z.infer<typeof runSchema>;
export type Track = z.infer<typeof trackSchema>;
export type Job = z.infer<typeof jobSchema>;
export function changeJobStatus(
  job: Job,
  status: Job["status"],
  at = new Date().toISOString(),
): Job {
  return jobSchema.parse({
    ...job,
    status,
    appliedAt:
      status === "Encontrada"
        ? null
        : job.appliedAt || (status === "Candidatura enviada" ? at : null),
  });
}
export type Goal = Data["goals"][number];
export type Area = (typeof areas)[number];
export function uid() {
  return crypto.randomUUID();
}
export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDays(date: string, count: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + count);
  return today(d);
}
export function monday(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return addDays(date, -((d.getDay() + 6) % 7));
}
export function emptyData(): Data {
  return {
    version: 1,
    tasks: [],
    runs: [],
    tracks: [],
    jobs: [],
    goals: [],
    settings: {
      weeklyKm: 15,
      dailyMinutes: 120,
      dailyFocus: "",
    },
  };
}
export function transitionTask(
  task: Task,
  action: "concluída" | "reaberta" | "pulada" | "reagendada",
  date = task.date,
  now = new Date().toISOString(),
): Task {
  dateSchema.parse(date);
  if (action === "reagendada" && date === task.date) return task;
  return taskSchema.parse({
    ...task,
    date: action === "reagendada" ? date : task.date,
    status:
      action === "concluída"
        ? "concluída"
        : action === "pulada"
          ? "pulada"
          : "pendente",
    completedAt: action === "concluída" ? now : null,
    history: [
      ...task.history,
      {
        at: now,
        action,
        from: task.date,
        to: action === "reagendada" ? date : task.date,
      },
    ],
  });
}
export function pace(seconds: number, distance: number) {
  if (distance <= 0 || seconds <= 0) return "—";
  const sec = Math.round(seconds / distance);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}
export function trackProgress(track: Track) {
  const topics = track.modules.flatMap((m) => m.topics);
  return { done: topics.filter((t) => t.done).length, total: topics.length };
}
export function parseBackup(raw: string): Data {
  if (raw.length > 2_000_000) throw new Error("Backup maior que 2 MB.");
  return dataSchema.parse(JSON.parse(raw));
}
export function weekKm(data: Data, date: string) {
  const start = monday(date);
  const end = addDays(start, 7);
  return data.runs
    .filter((r) => r.date >= start && r.date < end)
    .reduce((n, r) => n + r.distance, 0);
}
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) {
  return new Intl.DateTimeFormat("pt-BR", options).format(
    new Date(`${date}T12:00:00`),
  );
}
export function duration(seconds: number) {
  return `${Math.floor(seconds / 3600) ? `${Math.floor(seconds / 3600)}h ` : ""}${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}min`;
}

export function saveRun(data: Data, run: Run): Data {
  runSchema.parse(run);
  const old = data.runs.find((r) => r.id === run.id);
  if (
    run.taskId &&
    data.runs.some((r) => r.taskId === run.taskId && r.id !== run.id)
  )
    throw new Error("Este treino já tem uma corrida registrada.");
  return {
    ...data,
    runs: old
      ? data.runs.map((r) => (r.id === run.id ? run : r))
      : [...data.runs, run],
    tasks: data.tasks.map((t) => {
      if (t.id === run.taskId) {
        const scheduled =
          t.date === run.date ? t : transitionTask(t, "reagendada", run.date);
        return transitionTask(scheduled, "concluída");
      }
      return old?.taskId === t.id && old.taskId !== run.taskId
        ? transitionTask(t, "reaberta")
        : t;
    }),
  };
}
