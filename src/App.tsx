import { JobSearch } from "./components/JobSearch";
import { AnimatedIcon } from "./components/AnimatedIcon";
import { LessonGuide } from "./components/LessonGuide";
import { NewsPage } from "./components/NewsPage";
import { RunInsights } from "./components/RunInsights";
import { VoiceCommand } from "./components/VoiceCommand";
import { StudyExplorer } from "./components/StudyExplorer";
import { LearnHarnessPanel } from "./components/LearnHarnessPanel";
import { StravaPanel } from "./components/StravaPanel";
import { usePageMotion } from "./motion";
import {
  useEffect,
  useId,
  cloneElement,
  type ReactElement,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Footprints,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MoreHorizontal,
  Download,
  Upload,
  RotateCcw,
  CircleCheck,
  Circle,
  ExternalLink,
  Pencil,
  Trash2,
  WifiOff,
  Target,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  saveRun,
  changeJobStatus,
  addDays,
  areas,
  dataSchema,
  duration,
  formatDate,
  jobStatuses,
  monday,
  pace,
  parseBackup,
  today,
  trackProgress,
  transitionTask,
  uid,
  weekKm,
  type Area,
  type Data,
  type Goal,
  type Job,
  type Run,
  type Task,
  type Track,
} from "./model";
import { download, downloadRecovery, useData } from "./store";
import { createTrack, templateNames } from "./catalog";

type Page = "Hoje" | "Corrida" | "Estudos" | "Emprego" | "Semana" | "Notícias";
const navigation: Page[] = ["Hoje", "Corrida", "Estudos", "Emprego", "Semana", "Notícias"];
const areaName: Record<Area, string> = {
  corpo: "Corpo",
  estudos: "Estudos",
  emprego: "Emprego",
};
type Editor = {
  kind:
    | "task"
    | "run"
    | "track"
    | "job"
    | "goal"
    | "settings"
    | "topic"
    | "module"
    | "reschedule"
    | "confirm";
  id?: string;
  trackId?: string;
  moduleId?: string;
  date?: string;
  area?: Area;
  taskId?: string;
  message?: string;
  action?: () => void;
  jobDraft?: Partial<Job>;
};
const number = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
function Empty({
  icon: Icon = Target,
  title,
  children,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      className={secondary ? "button secondary" : "button"}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string }>;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
function Progress({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(max, 1)}
      aria-valuenow={Math.min(value, Math.max(max, 1))}
    >
      <span
        style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%` }}
      />
    </div>
  );
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="dialog-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label="Fechar" onClick={close}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function App() {
  const { data, update, restore, error, ready } = useData();
  const [page, setPage] = useState<Page>("Hoje");
  const [navPulse, setNavPulse] = useState(0);
  const [iconMotion, setIconMotion] = useState(() => {
    try {
      return localStorage.getItem("prumo.icon-motion") !== "off";
    } catch {
      return true;
    }
  });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [date, setDate] = useState(today());
  const [now, setNow] = useState(today());
  const [online, setOnline] = useState(navigator.onLine);
  const [jobFilter, setJobFilter] = useState("Todas");
  const [period, setPeriod] = useState<"semana" | "mês">("semana");
  const [openedTopics, setOpenedTopics] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  usePageMotion(mainRef, page, ready, date);
  useEffect(() => {
    const result = new URLSearchParams(location.search).get("strava");
    if (result) {
      setPage("Corrida");
      setNotice(
        result === "connected"
          ? "Strava conectado. Consulte suas corridas."
          : "A conexão não foi concluída. Tente novamente e confira as permissões.",
      );
      history.replaceState(null, "", location.pathname);
    }
  }, []);
  useEffect(() => {
    const sync = () => {
      setNow(today());
      setOnline(navigator.onLine);
    };
    const timer = setInterval(sync, 30000);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function open(value: Editor) {
    setFormError("");
    setEditor(value);
  }
  function act(fn: () => void, message = "Alteração salva.") {
    try {
      fn();
      setNotice(message);
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Não foi possível salvar.");
      setNotice(
        "Não foi possível salvar. Seus registros anteriores foram preservados.",
      );
      return false;
    }
  }
  function change(fn: (d: Data) => Data, message?: string) {
    return act(() => update(fn), message);
  }
  function confirm(message: string, fn: () => void) {
    open({ kind: "confirm", message, action: fn });
  }
  function remove(
    collection: "tasks" | "runs" | "tracks" | "jobs" | "goals",
    id: string,
  ) {
    confirm(
      "Excluir este registro? Esta ação não pode ser desfeita. Um backup permite recuperar seus dados.",
      () =>
        update((d) => {
          if (collection === "tasks")
            return {
              ...d,
              tasks: d.tasks.filter((t) => t.id !== id),
              runs: d.runs.map((r) =>
                r.taskId === id ? { ...r, taskId: null } : r,
              ),
            };
          if (collection === "runs") {
            const run = d.runs.find((r) => r.id === id);
            const rest = d.runs.filter((r) => r.id !== id);
            return {
              ...d,
              runs: rest,
              tasks: d.tasks.map((t) =>
                t.id === run?.taskId && !rest.some((r) => r.taskId === t.id)
                  ? transitionTask(t, "reaberta")
                  : t,
              ),
            };
          }
          if (collection === "goals")
            return {
              ...d,
              goals: d.goals.filter((g) => g.id !== id),
              tasks: d.tasks.map((t) =>
                t.goalId === id ? { ...t, goalId: null } : t,
              ),
            };
          return {
            ...d,
            [collection]: d[collection].filter((item) => item.id !== id),
          };
        }),
    );
  }
  function finish(task: Task) {
    if (task.status === "concluída") {
      change((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === task.id ? transitionTask(t, "reaberta") : t,
        ),
      }));
      return;
    }
    if (task.area === "corpo") {
      open({ kind: "run", taskId: task.id });
      return;
    }
    change((d) => ({
      ...d,
      tasks: d.tasks.map((t) =>
        t.id === task.id ? transitionTask(t, "concluída") : t,
      ),
    }));
  }
  function switchPage(value: Page) {
    setNavPulse((n) => n + 1);
    setPage(value);
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() =>
      mainRef.current?.focus({ preventScroll: true }),
    );
  }
  const todayTasks = data.tasks.filter((t) => t.date === now);
  const completed = todayTasks.filter((t) => t.status === "concluída").length;
  const next = todayTasks.find((t) => t.status === "pendente");
  const nextRun = data.tasks
    .filter(
      (t) => t.area === "corpo" && t.status === "pendente" && t.date >= now,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const activeTrack =
    data.tracks.find((t) => t.id === selectedTrack) || data.tracks[0];
  const activeTopic = activeTrack?.modules
    .flatMap((m) => m.topics)
    .find((t) => !t.done);
  const nextJob = todayTasks.find(
    (t) => t.area === "emprego" && t.status === "pendente",
  );
  const weekStart = monday(date);
  const km = weekKm(data, now);
  const dateLabel = formatDate(now, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  function taskList(tasks: Task[]) {
    return (
      <div className="task-list">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`task-row ${t.status === "concluída" ? "is-done" : ""}`}
          >
            <button
              className={`checkbox ${t.status === "concluída" ? "checked" : ""}`}
              aria-label={`${t.status === "concluída" ? "Reabrir" : "Concluir"} ${t.title}`}
              onClick={() => finish(t)}
            >
              {t.status === "concluída" && <Check size={16} />}
            </button>
            <div className="task-copy">
              <span>{t.title}</span>
              <small>
                {areaName[t.area]} · {t.minutes} min
                {t.status === "pulada" ? " · pulada" : ""}
                {t.history.some((h) => h.action === "reagendada")
                  ? " · reagendada"
                  : ""}
              </small>
            </div>
            <details className="task-menu">
              <summary aria-label={`Ações de ${t.title}`}>
                <MoreHorizontal size={20} />
              </summary>
              <div className="menu-panel">
                <button onClick={() => open({ kind: "task", id: t.id })}>
                  <Pencil size={15} />
                  Editar
                </button>
                <button onClick={() => open({ kind: "reschedule", id: t.id })}>
                  <CalendarDays size={15} />
                  Reagendar
                </button>
                <button
                  onClick={() =>
                    change((d) => ({
                      ...d,
                      tasks: d.tasks.map((item) =>
                        item.id === t.id
                          ? transitionTask(item, "pulada")
                          : item,
                      ),
                    }))
                  }
                >
                  Pular tarefa
                </button>
                <button
                  onClick={() => remove("tasks", t.id)}
                  className="danger-text"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>
            </details>
          </div>
        ))}
      </div>
    );
  }
  function editButton(label: string, fn: () => void) {
    return (
      <button className="icon-button" aria-label={label} onClick={fn}>
        <Pencil size={16} />
      </button>
    );
  }
  function consistency() {
    return (
      <section>
        <div className="section-heading">
          <h2>Consistência</h2>
          <span>Últimos 7 dias</span>
        </div>
        <div className="consistency">
          {Array.from({ length: 7 }, (_, i) => addDays(now, i - 6)).map(
            (day) => {
              const count =
                data.tasks.filter(
                  (t) =>
                    t.status === "concluída" &&
                    t.completedAt &&
                    today(new Date(t.completedAt)) === day,
                ).length +
                data.runs.filter((r) => r.date === day && !r.taskId).length;
              return (
                <div
                  key={day}
                  title={`${formatDate(day)}: ${count} ações concluídas`}
                >
                  <span className={count ? "active" : ""}>
                    {count ? <Check size={17} /> : <span className="day-dot" />}
                  </span>
                  <small>{formatDate(day, { weekday: "narrow" })}</small>
                </div>
              );
            },
          )}
        </div>
        <p className="muted small">
          Cada dia guarda o que você fez. Recomece de onde parou.
        </p>
      </section>
    );
  }

  function saveForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setFormError("");
    const f = new FormData(event.currentTarget);
    const s = (key: string) => String(f.get(key) || "").trim();
    const n = (key: string) => Number(s(key));
    try {
      update((d) => {
        if (editor.kind === "task") {
          const old = d.tasks.find((t) => t.id === editor.id);
          const task: Task = {
            id: old?.id || uid(),
            title: s("title"),
            area: s("area") as Area,
            date: s("date"),
            minutes: n("minutes"),
            status: old?.status || "pendente",
            completedAt: old?.completedAt || null,
            history: old?.history || [],
            goalId: s("goalId") || null,
          };
          if (old && old.date !== task.date)
            task.history = transitionTask(old, "reagendada", task.date).history;
          return {
            ...d,
            tasks: old
              ? d.tasks.map((t) => (t.id === old.id ? task : t))
              : [...d.tasks, task],
          };
        }
        if (editor.kind === "reschedule") {
          return {
            ...d,
            tasks: d.tasks.map((t) =>
              t.id === editor.id
                ? transitionTask(t, "reagendada", s("date"))
                : t,
            ),
          };
        }
        if (editor.kind === "run") {
          const old = d.runs.find((r) => r.id === editor.id);
          if (s("date") > now)
            throw new Error(
              "Registre uma corrida realizada. Para um treino futuro, crie uma tarefa.",
            );
          const taskId = s("taskId") || null;
          if (
            taskId &&
            d.runs.some((r) => r.taskId === taskId && r.id !== old?.id)
          )
            throw new Error(
              "Este treino já tem uma corrida registrada. Edite o registro existente.",
            );
          const run: Run = {
            id: old?.id || uid(),
            date: s("date"),
            distance: n("distance"),
            seconds: Math.round(n("minutes") * 60),
            notes: s("notes"),
            taskId,
          };
          return saveRun(d, run);
        }
        if (editor.kind === "job") {
          const old = d.jobs.find((j) => j.id === editor.id);
          const job: Job = {
            id: old?.id || uid(),
            company: s("company"),
            role: s("role"),
            url: s("url"),
            date: s("date"),
            status: s("status") as Job["status"],
            contact: s("contact"),
            notes: s("notes"),
          };
          if (
            job.url &&
            d.jobs.some(
              (saved) => saved.id !== old?.id && saved.url === job.url,
            )
          )
            throw new Error(
              "Esta vaga já está no seu painel. Edite o registro existente.",
            );
          return {
            ...d,
            jobs: old
              ? d.jobs.map((j) =>
                  j.id === old.id
                    ? changeJobStatus(
                        { ...job, appliedAt: old.appliedAt },
                        job.status,
                      )
                    : j,
                )
              : [...d.jobs, changeJobStatus(job, job.status)],
          };
        }
        if (editor.kind === "goal") {
          const old = d.goals.find((g) => g.id === editor.id);
          const goal: Goal = {
            id: old?.id || uid(),
            title: s("title"),
            area: s("area") as Area,
            deadline: s("deadline") || null,
            weeklyTarget: s("weeklyTarget"),
            done: old?.done || false,
          };
          return {
            ...d,
            goals: old
              ? d.goals.map((g) => (g.id === old.id ? goal : g))
              : [...d.goals, goal],
          };
        }
        if (editor.kind === "track") {
          const old = d.tracks.find((t) => t.id === editor.id);
          const track = old
            ? {
                ...old,
                title: s("title"),
                objective: s("objective"),
                prerequisites: s("prerequisites"),
              }
            : createTrack(s("title"), s("template"));
          return {
            ...d,
            tracks: old
              ? d.tracks.map((t) => (t.id === old.id ? track : t))
              : [...d.tracks, track],
          };
        }
        if (editor.kind === "module") {
          return {
            ...d,
            tracks: d.tracks.map((t) =>
              t.id === editor.trackId
                ? {
                    ...t,
                    modules: editor.id
                      ? t.modules.map((m) =>
                          m.id === editor.id ? { ...m, title: s("title") } : m,
                        )
                      : [
                          ...t.modules,
                          { id: uid(), title: s("title"), topics: [] },
                        ],
                  }
                : t,
            ),
          };
        }
        if (editor.kind === "topic") {
          const resources = Array.from(
            { length: n("resourceCount") },
            (_, i) => ({
              title: s(`resourceTitle${i}`),
              url: s(`resourceUrl${i}`),
              why: s(`resourceWhy${i}`),
            }),
          ).filter((r) => r.title || r.url || r.why);
          return {
            ...d,
            tracks: d.tracks.map((t) =>
              t.id === editor.trackId
                ? {
                    ...t,
                    modules: t.modules.map((m) =>
                      m.id === editor.moduleId
                        ? {
                            ...m,
                            topics: editor.id
                              ? m.topics.map((tp) =>
                                  tp.id === editor.id
                                    ? {
                                        ...tp,
                                        title: s("title"),
                                        criteria: s("criteria"),
                                        exercise: s("exercise"),
                                        resources,
                                        reviewDate: s("reviewDate") || null,
                                      }
                                    : tp,
                                )
                              : [
                                  ...m.topics,
                                  {
                                    id: uid(),
                                    title: s("title"),
                                    criteria: s("criteria"),
                                    exercise: s("exercise"),
                                    resources,
                                    done: false,
                                    reviewDate: s("reviewDate") || null,
                                    reviewed: false,
                                  },
                                ],
                          }
                        : m,
                    ),
                  }
                : t,
            ),
          };
        }
        if (editor.kind === "settings")
          return {
            ...d,
            settings: {
              weeklyKm: n("weeklyKm"),
              dailyMinutes: n("dailyMinutes"),
              dailyFocus: s("dailyFocus"),
            },
          };
        return d;
      });
      setEditor(null);
      setNotice("Salvo no seu dispositivo.");
    } catch (e) {
      setFormError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Confira os campos: preencha os obrigatórios, use valores válidos e links http ou https.",
      );
    }
  }

  function renderEditor() {
    if (!editor) return null;
    const task = data.tasks.find((t) => t.id === editor.id);
    const run = data.runs.find((r) => r.id === editor.id);
    const job = data.jobs.find((j) => j.id === editor.id) || editor.jobDraft;
    const goal = data.goals.find((g) => g.id === editor.id);
    const track = data.tracks.find(
      (t) => t.id === (editor.trackId || editor.id),
    );
    const mod = track?.modules.find(
      (m) => m.id === (editor.moduleId || editor.id),
    );
    const topic = mod?.topics.find((t) => t.id === editor.id);
    const titles = {
      task: task ? "Editar tarefa" : "Nova tarefa",
      run: run ? "Editar corrida" : "Registrar corrida",
      job: job ? "Editar vaga" : "Salvar vaga",
      goal: goal ? "Editar objetivo" : "Novo objetivo",
      track: track ? "Editar trilha" : "Criar trilha",
      settings: "Seu espaço",
      reschedule: "Reagendar tarefa",
      module: editor.id ? "Editar módulo" : "Novo módulo",
      topic: topic ? "Editar tópico" : "Novo tópico",
      confirm: "Confirmar alteração",
    };
    return (
      <Modal title={titles[editor.kind]} close={() => setEditor(null)}>
        {editor.kind === "confirm" ? (
          <>
            <p className="dialog-description">{editor.message}</p>
            {formError && (
              <p role="alert" className="form-error">
                {formError}
              </p>
            )}
            <div className="dialog-actions">
              <Button secondary onClick={() => setEditor(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editor.action && act(editor.action)) setEditor(null);
                }}
              >
                Confirmar
              </Button>
            </div>
          </>
        ) : (
          <form
            onSubmit={saveForm}
            key={`${editor.kind}-${editor.id || "new"}`}
          >
            {editor.kind === "task" && (
              <>
                <Field label="O que você vai fazer?">
                  <input
                    name="title"
                    required
                    maxLength={180}
                    defaultValue={task?.title}
                    placeholder="Ex.: estudar Service Discovery"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Área">
                    <select
                      name="area"
                      defaultValue={task?.area || editor.area || "estudos"}
                    >
                      {areas.map((a) => (
                        <option key={a} value={a}>
                          {areaName[a]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tempo (min)">
                    <input
                      name="minutes"
                      type="number"
                      required
                      min="1"
                      max="1440"
                      defaultValue={task?.minutes || 30}
                    />
                  </Field>
                </div>
                <Field label="Data">
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={task?.date || editor.date || now}
                  />
                </Field>
                <Field label="Vincular a um objetivo">
                  <select name="goalId" defaultValue={task?.goalId || ""}>
                    <option value="">Sem vínculo</option>
                    {data.goals.map((g) => (
                      <option value={g.id} key={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            {editor.kind === "reschedule" && (
              <>
                <p className="dialog-description">
                  {task?.title}. A data anterior será mantida no histórico.
                </p>
                <Field label="Nova data">
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={addDays(task?.date || now, 1)}
                  />
                </Field>
              </>
            )}
            {editor.kind === "run" && (
              <>
                <Field label="Quando você correu?">
                  <input
                    name="date"
                    type="date"
                    required
                    max={now}
                    defaultValue={run?.date || now}
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Distância (km)">
                    <input
                      name="distance"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      max="500"
                      required
                      defaultValue={run?.distance}
                      placeholder="5"
                    />
                  </Field>
                  <Field label="Duração (min)">
                    <input
                      name="minutes"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.02"
                      max="10080"
                      required
                      defaultValue={
                        run ? Number((run.seconds / 60).toFixed(2)) : undefined
                      }
                      placeholder="35"
                    />
                  </Field>
                </div>
                <Field
                  label="Treino planejado"
                  hint="Vincular conclui a tarefa junto com o registro."
                >
                  <select
                    name="taskId"
                    defaultValue={run?.taskId || editor.taskId || ""}
                  >
                    <option value="">Corrida avulsa</option>
                    {data.tasks
                      .filter(
                        (t) =>
                          t.area === "corpo" &&
                          (t.status === "pendente" || t.id === run?.taskId),
                      )
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} · {formatDate(t.date)}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Observações (opcional)">
                  <textarea
                    name="notes"
                    maxLength={5000}
                    defaultValue={run?.notes}
                    placeholder="Como foi o treino?"
                  />
                </Field>
              </>
            )}
            {editor.kind === "job" && (
              <>
                <Field label="Empresa">
                  <input
                    name="company"
                    required
                    maxLength={180}
                    defaultValue={job?.company}
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    name="role"
                    required
                    maxLength={180}
                    defaultValue={job?.role}
                  />
                </Field>
                <Field label="Link da vaga (opcional)">
                  <input
                    name="url"
                    type="url"
                    maxLength={2000}
                    defaultValue={job?.url}
                    placeholder="https://…"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Data">
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={job?.date || now}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      name="status"
                      defaultValue={job?.status || "Encontrada"}
                    >
                      {jobStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Contato (opcional)">
                  <input
                    name="contact"
                    maxLength={500}
                    defaultValue={job?.contact}
                    placeholder="Nome, e-mail ou LinkedIn"
                  />
                </Field>
                <Field label="Observações (opcional)">
                  <textarea
                    name="notes"
                    maxLength={5000}
                    defaultValue={job?.notes}
                  />
                </Field>
              </>
            )}
            {editor.kind === "goal" && (
              <>
                <Field label="Objetivo de longo prazo">
                  <input
                    name="title"
                    required
                    maxLength={180}
                    defaultValue={goal?.title}
                    placeholder="Ex.: conquistar minha primeira vaga Java"
                  />
                </Field>
                <Field label="Meta semanal">
                  <input
                    name="weeklyTarget"
                    required
                    maxLength={180}
                    defaultValue={goal?.weeklyTarget}
                    placeholder="Ex.: enviar 6 candidaturas alinhadas"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Área">
                    <select name="area" defaultValue={goal?.area || "emprego"}>
                      {areas.map((a) => (
                        <option key={a} value={a}>
                          {areaName[a]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Prazo (opcional)">
                    <input
                      name="deadline"
                      type="date"
                      defaultValue={goal?.deadline || ""}
                    />
                  </Field>
                </div>
              </>
            )}
            {editor.kind === "track" && (
              <>
                <Field label="O que você quer aprender?">
                  <input
                    name="title"
                    required
                    maxLength={180}
                    defaultValue={track?.title}
                    placeholder="Ex.: Spring Cloud"
                  />
                </Field>
                {track ? (
                  <>
                    <Field label="Objetivo">
                      <textarea
                        name="objective"
                        maxLength={5000}
                        defaultValue={track.objective}
                      />
                    </Field>
                    <Field label="Pré-requisitos">
                      <textarea
                        name="prerequisites"
                        maxLength={5000}
                        defaultValue={track.prerequisites}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Ponto de partida">
                      <select name="template" defaultValue="auto">
                        <option value="auto">
                          Sugerir a partir do objetivo
                        </option>
                        {templateNames.map((n) => (
                          <option value={n} key={n}>
                            {n} · trilha curada
                          </option>
                        ))}
                        <option value="manual">
                          Trilha manual · outro assunto
                        </option>
                      </select>
                    </Field>
                    <p className="muted small">
                      Os modelos têm documentação oficial, exercícios e
                      critérios. Para outro assunto, escolha a trilha manual e
                      personalize módulos e tópicos.
                    </p>
                  </>
                )}
              </>
            )}
            {editor.kind === "module" && (
              <Field label="Nome do módulo">
                <input
                  name="title"
                  required
                  maxLength={180}
                  defaultValue={mod?.title}
                />
              </Field>
            )}
            {editor.kind === "topic" && (
              <>
                <Field label="Tópico">
                  <input
                    name="title"
                    required
                    maxLength={180}
                    defaultValue={topic?.title}
                  />
                </Field>
                <Field label="Critérios de conclusão">
                  <textarea
                    name="criteria"
                    required
                    maxLength={5000}
                    defaultValue={topic?.criteria}
                    placeholder="O que você precisa conseguir explicar ou fazer?"
                  />
                </Field>
                <Field label="Exercício ou pequeno projeto">
                  <textarea
                    name="exercise"
                    required
                    maxLength={5000}
                    defaultValue={topic?.exercise}
                  />
                </Field>
                <Field label="Revisão (opcional)">
                  <input
                    name="reviewDate"
                    type="date"
                    defaultValue={topic?.reviewDate || ""}
                  />
                </Field>
                <h3>Recursos de estudo</h3>
                <input
                  type="hidden"
                  name="resourceCount"
                  value={Math.min(20, (topic?.resources.length || 0) + 1)}
                />
                {Array.from(
                  { length: Math.min(20, (topic?.resources.length || 0) + 1) },
                  (_, i) => (
                    <fieldset key={i}>
                      <legend>
                        Recurso {i + 1}
                        {i === (topic?.resources.length || 0)
                          ? " · opcional"
                          : ""}
                      </legend>
                      <Field label="Título do recurso">
                        <input
                          name={`resourceTitle${i}`}
                          maxLength={180}
                          defaultValue={topic?.resources[i]?.title}
                        />
                      </Field>
                      <Field label="Link">
                        <input
                          name={`resourceUrl${i}`}
                          type="url"
                          maxLength={2000}
                          defaultValue={topic?.resources[i]?.url}
                        />
                      </Field>
                      <Field label="Por que e quando estudar">
                        <textarea
                          name={`resourceWhy${i}`}
                          maxLength={5000}
                          defaultValue={topic?.resources[i]?.why}
                        />
                      </Field>
                    </fieldset>
                  ),
                )}
              </>
            )}
            {editor.kind === "settings" && (
              <>
                <p className="dialog-description">
                  Seus registros ficam neste navegador. Faça backups para
                  preservar seu histórico ou transferir para outro aparelho.
                </p>
                <Field label="Objetivo do dia">
                  <input
                    name="dailyFocus"
                    maxLength={180}
                    defaultValue={data.settings.dailyFocus}
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Corrida semanal (km)">
                    <input
                      name="weeklyKm"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      required
                      defaultValue={data.settings.weeklyKm}
                    />
                  </Field>
                  <Field label="Tempo diário (min)">
                    <input
                      name="dailyMinutes"
                      type="number"
                      min="1"
                      max="1440"
                      required
                      defaultValue={data.settings.dailyMinutes}
                    />
                  </Field>
                </div>
                <label className="motion-preference">
                  <input
                    type="checkbox"
                    checked={iconMotion}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setIconMotion(enabled);
                      try {
                        localStorage.setItem(
                          "prumo.icon-motion",
                          enabled ? "on" : "off",
                        );
                      } catch {
                        /* A preferência continua funcionando nesta sessão. */
                      }
                    }}
                  />
                  <span>Animar ícones da navegação</span>
                </label>
                <div className="backup-actions">
                  <Button
                    type="button"
                    secondary
                    onClick={() =>
                      download(
                        JSON.stringify(data, null, 2),
                        `prumo-backup-${now}.json`,
                      )
                    }
                  >
                    <Download size={17} />
                    Exportar backup
                  </Button>
                  <Button
                    type="button"
                    secondary
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={17} />
                    Restaurar backup
                  </Button>
                </div>
                <details className="help">
                  <summary>Instalar no iPhone</summary>
                  <p>
                    No Safari, abra Compartilhar e escolha “Adicionar à Tela de
                    Início”. Após o primeiro carregamento, seus registros também
                    ficam disponíveis offline.
                  </p>
                  <p>
                    Não há sincronização entre aparelhos. Limpar os dados do
                    navegador pode apagar os registros; guarde seu backup.
                  </p>
                </details>
              </>
            )}
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <div className="dialog-actions">
              <Button type="button" secondary onClick={() => setEditor(null)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar{editor.kind === "run" ? " corrida" : ""}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    );
  }

  function backupInput() {
    return (
      <input
        className="sr-only"
        type="file"
        accept="application/json,.json"
        ref={fileRef}
        aria-label="Arquivo de backup"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          try {
            if (file.size > 2_000_000)
              throw new Error("O backup deve ter até 2 MB.");
            const next = parseBackup(await file.text());
            confirm(
              `Restaurar ${next.tasks.length} tarefas, ${next.runs.length} corridas, ${next.tracks.length} trilhas e ${next.jobs.length} vagas? Os registros atuais serão substituídos. Uma cópia anterior será guardada neste navegador.`,
              () => restore(next),
            );
          } catch {
            setFormError(
              "Backup inválido. Escolha um arquivo JSON exportado pelo Prumo, de até 2 MB. Seus dados foram preservados.",
            );
          }
        }}
      />
    );
  }

  if (!ready)
    return (
      <main className="loading" aria-busy="true">
        Abrindo seu espaço…
      </main>
    );
  if (error)
    return (
      <main className="recovery">
        <h1>Seus dados precisam de atenção</h1>
        <p role="alert">{error}</p>
        <Button onClick={downloadRecovery}>
          <Download size={18} />
          Baixar dados para recuperação
        </Button>
        <Button secondary onClick={() => fileRef.current?.click()}>
          <Upload size={18} />
          Restaurar um backup válido
        </Button>
        {backupInput()}
        {renderEditor()}
        {formError && !editor && <p role="alert">{formError}</p>}
        <p>
          Nenhum dado foi substituído. Confira se o armazenamento do navegador
          está habilitado.
        </p>
      </main>
    );
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="app-shell">
        <header className="topbar">
          <button
            className="wordmark"
            onClick={() => switchPage("Hoje")}
            aria-label="Prumo, início"
          >
            prumo<span>.</span>
          </button>
          <div className="topbar-right">
            <button
              className="icon-button voice-trigger"
              onClick={() => setVoiceOpen(true)}
              aria-label="Comando de voz"
            >
              <AnimatedIcon name="Voz" size={22} motion={iconMotion} />
            </button>
            {!online && (
              <span className="offline">
                <WifiOff size={14} />
                Offline
              </span>
            )}
            <span className="local-label">Seu espaço pessoal</span>
            <button
              className="icon-button settings-button"
              onClick={() => open({ kind: "settings" })}
              aria-label="Preferências e backup"
            >
              <SlidersHorizontal size={21} />
            </button>
          </div>
        </header>
        <main id="conteudo" ref={mainRef} tabIndex={-1}>
          <div className="page-heading">
            {page === "Hoje" && <p className="eyebrow">{dateLabel}</p>}
            <h1>
              {page}
              <span className="title-dot">.</span>
            </h1>
          </div>
          {page === "Hoje" && (
            <>
              {data.settings.dailyFocus.trim() &&
                data.settings.dailyFocus !==
                  "Corpo em movimento. Um passo na carreira." && (
                  <section className="intro">
                    <h2>Objetivo do dia</h2>
                    <p>{data.settings.dailyFocus}</p>
                  </section>
                )}
              <div className="dashboard-grid">
                <div className="stack">
                  <section className="glass next-action">
                    <div className="eyebrow">
                      <span className="status-dot" />
                      {next
                        ? `Próxima ação · ${areaName[next.area]}`
                        : "Seu próximo passo"}
                    </div>
                    <h2>{next?.title || "O que importa hoje?"}</h2>
                    <p>
                      {next
                        ? `${next.minutes} min previstos.`
                        : "Escolha uma ação possível para o corpo, os estudos ou a carreira."}
                    </p>
                    <Button
                      onClick={() =>
                        next ? finish(next) : open({ kind: "task" })
                      }
                    >
                      {next
                        ? next.area === "corpo"
                          ? "Registrar corrida"
                          : "Concluir ação"
                        : "Planejar meu dia"}
                      <ArrowRight size={18} />
                    </Button>
                  </section>
                  <section>
                    <div className="section-heading">
                      <h2>Seu dia</h2>
                      <span>
                        {completed} de {todayTasks.length} feitas
                      </span>
                    </div>
                    <Progress
                      value={completed}
                      max={todayTasks.length}
                      label="Tarefas concluídas hoje"
                    />
                    {todayTasks.length ? (
                      taskList(todayTasks)
                    ) : (
                      <Empty title="Um dia em aberto">
                        Comece com uma tarefa pequena e concreta.
                      </Empty>
                    )}
                    <button
                      className="text-button"
                      onClick={() => open({ kind: "task" })}
                    >
                      <Plus size={17} />
                      Adicionar tarefa
                    </button>
                    {todayTasks.filter((t) => t.status !== "pulada").length >
                      3 && (
                      <p className="planning-note">
                        Você tem mais de três ações. Escolha o essencial e deixe
                        espaço para imprevistos.
                      </p>
                    )}
                  </section>
                  {consistency()}
                </div>
                <aside
                  className="daily-overview"
                  aria-label="Resumo das suas áreas"
                >
                  <div className="section-heading">
                    <h2>Em foco</h2>
                    <span>Os três pilares</span>
                  </div>
                  {[
                    [
                      Footprints,
                      "Corpo",
                      nextRun?.title || "Nenhum treino planejado",
                      nextRun
                        ? formatDate(nextRun.date)
                        : "Planeje um treino possível",
                      "Corrida",
                    ],
                    [
                      BookOpen,
                      "Estudos",
                      activeTopic?.title || "Sua próxima descoberta",
                      activeTrack?.title || "Crie uma trilha de aprendizado",
                      "Estudos",
                    ],
                    [
                      BriefcaseBusiness,
                      "Carreira",
                      nextJob?.title || "Um passo profissional",
                      nextJob
                        ? `${nextJob.minutes} min`
                        : "Salve uma vaga ou planeje uma ação",
                      "Emprego",
                    ],
                  ].map(([, title, body, sub, target]) => {
                    return (
                      <button
                        className="pillar"
                        key={String(title)}
                        onClick={() => switchPage(target as Page)}
                      >
                        <span className="pillar-icon">
                          <AnimatedIcon name={target as Page} motion={iconMotion} size={26} />
                        </span>
                        <span>
                          <small>{String(title)}</small>
                          <strong>{String(body)}</strong>
                          <span>{String(sub)}</span>
                        </span>
                        <ArrowUpRight size={18} />
                      </button>
                    );
                  })}
                  <div className="week-peek">
                    <span className="eyebrow">Corrida nesta semana</span>
                    <p>
                      <strong>{number(km)}</strong> /{" "}
                      {number(data.settings.weeklyKm)} km
                    </p>
                    <Progress
                      value={km}
                      max={data.settings.weeklyKm}
                      label="Meta semanal de corrida"
                    />
                    <button
                      className="text-button"
                      onClick={() => switchPage("Semana")}
                    >
                      Ver planejamento
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
          {page === "Corrida" && (
            <div className="two-column">
              <div className="stack">
                <section className="glass metric-card">
                  <div className="section-heading">
                    <span className="eyebrow">Sua semana</span>
                    {editButton("Editar meta semanal", () =>
                      open({ kind: "settings" }),
                    )}
                  </div>
                  <p className="metric">
                    <strong>
                      {number(km)}
                      <small> km</small>
                    </strong>
                    <span>de {number(data.settings.weeklyKm)} km</span>
                  </p>
                  <Progress
                    value={km}
                    max={data.settings.weeklyKm}
                    label="Meta semanal de corrida"
                  />
                  <p className="muted small">
                    {
                      data.runs.filter(
                        (r) =>
                          r.date >= monday(now) &&
                          r.date < addDays(monday(now), 7),
                      ).length
                    }{" "}
                    corridas registradas ·{" "}
                    {Math.round((km / data.settings.weeklyKm) * 100)}% da meta
                  </p>
                </section>
                <Button onClick={() => open({ kind: "run" })}>
                  <Plus size={18} />
                  Registrar corrida
                </Button>
                <StravaPanel />
                <section>
                  <div className="section-heading">
                    <h2>Próximo treino</h2>
                    <button
                      className="text-button"
                      onClick={() => open({ kind: "task", area: "corpo" })}
                    >
                      Planejar
                      <Plus size={15} />
                    </button>
                  </div>
                  {nextRun ? (
                    <div className="glass">
                      <span className="eyebrow">
                        {formatDate(nextRun.date, {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <h3 className="card-title">{nextRun.title}</h3>
                      <p>{nextRun.minutes} min · planejado por você</p>
                      <div className="inline-actions">
                        <Button
                          secondary
                          onClick={() =>
                            open({ kind: "reschedule", id: nextRun.id })
                          }
                        >
                          Reagendar
                        </Button>
                        <Button
                          secondary
                          onClick={() =>
                            change((d) => ({
                              ...d,
                              tasks: d.tasks.map((t) =>
                                t.id === nextRun.id
                                  ? transitionTask(t, "pulada")
                                  : t,
                              ),
                            }))
                          }
                        >
                          Pular treino
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Empty icon={Footprints} title="Sem treino planejado">
                      Adicione um treino à semana ou registre uma corrida
                      avulsa.
                    </Empty>
                  )}
                </section>
                <section>
                  <div className="section-heading">
                    <h2>Evolução</h2>
                    <div className="segmented" aria-label="Período da evolução">
                      <button
                        aria-pressed={period === "semana"}
                        onClick={() => setPeriod("semana")}
                      >
                        Semanas
                      </button>
                      <button
                        aria-pressed={period === "mês"}
                        onClick={() => setPeriod("mês")}
                      >
                        Meses
                      </button>
                    </div>
                  </div>
                  <div className="glass chart">
                    {Array.from({ length: 4 }, (_, i) => {
                      let start: string;
                      let end: string;
                      if (period === "semana") {
                        start = addDays(monday(now), (i - 3) * 7);
                        end = addDays(start, 7);
                      } else {
                        const d = new Date(`${now}T12:00:00`);
                        d.setDate(1);
                        d.setMonth(d.getMonth() + i - 3);
                        start = today(d);
                        d.setMonth(d.getMonth() + 1);
                        end = today(d);
                      }
                      return {
                        start,
                        value: data.runs
                          .filter((r) => r.date >= start && r.date < end)
                          .reduce((sum, r) => sum + r.distance, 0),
                      };
                    }).map((p, _, list) => (
                      <div className="chart-column" key={p.start}>
                        <strong>
                          {number(p.value)}
                          <small> km</small>
                        </strong>
                        <div className="bar-track">
                          <span
                            style={{
                              height: `${p.value ? Math.max(4, (p.value / Math.max(...list.map((v) => v.value), 1)) * 100) : 2}%`,
                            }}
                          />
                        </div>
                        <small>
                          {formatDate(
                            p.start,
                            period === "semana"
                              ? { day: "numeric", month: "short" }
                              : { month: "short" },
                          )}
                        </small>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <section>
                <div className="section-heading">
                  <h2>Histórico de corridas</h2>
                  <span>{data.runs.length} registros</span>
                </div>
                {data.runs.length ? (
                  <div className="run-history">
                    {[...data.runs]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((r) => (
                        <article className="run-entry" key={r.id}>
                          <div className="section-heading">
                            <span className="muted small">
                              {formatDate(r.date, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <div className="mini-actions">
                              {editButton(
                                "Editar corrida de " + formatDate(r.date),
                                () => open({ kind: "run", id: r.id }),
                              )}
                              <button
                                className="icon-button"
                                aria-label="Excluir corrida"
                                onClick={() => remove("runs", r.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                          <div className="run-numbers">
                            <strong>
                              {number(r.distance)}
                              <small> km</small>
                            </strong>
                            <span>
                              {duration(r.seconds)}
                              <small>{pace(r.seconds, r.distance)} /km</small>
                            </span>
                          </div>
                          {r.notes && <p className="small muted">{r.notes}</p>}
                        </article>
                      ))}
                  </div>
                ) : (
                  <Empty
                    icon={Footprints}
                    title="Sua primeira corrida começa aqui"
                  >
                    Registre distância, duração e data. O ritmo será calculado
                    automaticamente.
                  </Empty>
                )}
              </section>
            </div>
          )}
          {page === "Estudos" && (
            <>
              <LearnHarnessPanel tracks={data.tracks} />
              <StudyExplorer
                track={activeTrack}
                onChange={change}
                onCreated={setSelectedTrack}
              />
              {data.tracks.length > 0 && (
                <div className="track-selector">
                  <Field label="Trilha ativa">
                    <select
                      value={activeTrack?.id}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                    >
                      {data.tracks.map((t) => (
                        <option value={t.id} key={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Button secondary onClick={() => open({ kind: "track" })}>
                    <Plus size={17} />
                    Criar trilha
                  </Button>
                </div>
              )}
              {!activeTrack ? (
                <Empty
                  icon={BookOpen}
                  title="Aprender com um caminho claro"
                  action={
                    <Button onClick={() => open({ kind: "track" })}>
                      <Plus size={18} />
                      Criar primeira trilha
                    </Button>
                  }
                >
                  Escolha Java, Docker, Spring Cloud ou arquitetura. Cada trilha
                  reúne fundamentos, prática e critérios de conclusão. Você
                  também pode montar a sua.
                </Empty>
              ) : (
                <div className="two-column">
                  <div className="stack">
                    <section className="glass">
                      <div className="section-heading">
                        <span className="eyebrow">Trilha atual</span>
                        <div className="mini-actions">
                          {editButton("Editar trilha", () =>
                            open({ kind: "track", id: activeTrack.id }),
                          )}
                          <button
                            className="icon-button"
                            aria-label="Excluir trilha"
                            onClick={() => remove("tracks", activeTrack.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h2 className="feature-title">{activeTrack.title}</h2>
                      <p>{activeTrack.objective}</p>
                      <Progress
                        {...{
                          value: trackProgress(activeTrack).done,
                          max: trackProgress(activeTrack).total,
                          label: "Progresso da trilha",
                        }}
                      />
                      <p className="small muted">
                        {trackProgress(activeTrack).done} de{" "}
                        {trackProgress(activeTrack).total} tópicos concluídos
                      </p>
                      <details className="help">
                        <summary>Conhecimentos prévios</summary>
                        <p>{activeTrack.prerequisites}</p>
                      </details>
                    </section>
                    <section>
                      <div className="section-heading">
                        <h2>Revisões</h2>
                        <RotateCcw size={17} />
                      </div>
                      {activeTrack.modules
                        .flatMap((m) => m.topics)
                        .filter((t) => t.done && t.reviewDate && !t.reviewed)
                        .length ? (
                        activeTrack.modules
                          .flatMap((m) => m.topics)
                          .filter((t) => t.done && t.reviewDate && !t.reviewed)
                          .sort((a, b) =>
                            a.reviewDate!.localeCompare(b.reviewDate!),
                          )
                          .map((t) => (
                            <div className="review-row" key={t.id}>
                              <div>
                                <strong>{t.title}</strong>
                                <small>
                                  {t.reviewDate! <= now
                                    ? "Revisar agora"
                                    : formatDate(t.reviewDate!)}
                                </small>
                              </div>
                              <button
                                className="icon-button"
                                aria-label={`Concluir revisão de ${t.title}`}
                                onClick={() =>
                                  change((d) => ({
                                    ...d,
                                    tracks: d.tracks.map((tr) => ({
                                      ...tr,
                                      modules: tr.modules.map((m) => ({
                                        ...m,
                                        topics: m.topics.map((tp) =>
                                          tp.id === t.id
                                            ? { ...tp, reviewed: true }
                                            : tp,
                                        ),
                                      })),
                                    })),
                                  }))
                                }
                              >
                                <Check size={18} />
                              </button>
                            </div>
                          ))
                      ) : (
                        <p className="muted">
                          Ao concluir um tópico, uma revisão será agendada para
                          daqui a 7 dias.
                        </p>
                      )}
                    </section>
                  </div>
                  <section className="modules">
                    <div className="study-current">
                      <span className="eyebrow">Próximo passo</span>
                      <h3>
                        {activeTopic?.title ||
                          "Trilha concluída. Hora de revisar."}
                      </h3>
                      <p className="muted small">
                        {activeTopic?.exercise ||
                          "Consulte as revisões e consolide seu projeto."}
                      </p>
                      {activeTopic && (
                        <button
                          className="text-button"
                          onClick={() => {
                            const topic = document.getElementById(
                              `topic-${activeTopic.id}`,
                            );
                            if (topic instanceof HTMLDetailsElement) {
                              topic.open = true;
                              topic.scrollIntoView({
                                block: "center",
                                behavior: matchMedia(
                                  "(prefers-reduced-motion: reduce)",
                                ).matches
                                  ? "instant"
                                  : "smooth",
                              });
                              topic
                                .querySelector("summary")
                                ?.focus({ preventScroll: true });
                            }
                          }}
                        >
                          Continuar tópico
                          <ArrowRight size={15} />
                        </button>
                      )}
                      <span className="study-count">
                        {activeTrack.modules.length} módulos ·{" "}
                        {trackProgress(activeTrack).total} tópicos · prática em
                        cada etapa
                      </span>
                    </div>
                    <div className="section-heading">
                      <h2>Sua trilha</h2>
                      <button
                        className="text-button"
                        onClick={() =>
                          open({ kind: "module", trackId: activeTrack.id })
                        }
                      >
                        <Plus size={16} />
                        Módulo
                      </button>
                    </div>
                    {activeTrack.modules.map((m, i) => (
                      <article key={m.id} className="module">
                        <div className="module-heading">
                          <span className="module-number">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3>{m.title}</h3>
                            <small>
                              {m.topics.filter((t) => t.done).length} de{" "}
                              {m.topics.length} tópicos
                            </small>
                          </div>
                          <div className="mini-actions">
                            {editButton("Editar módulo " + m.title, () =>
                              open({
                                kind: "module",
                                id: m.id,
                                trackId: activeTrack.id,
                              }),
                            )}
                            <button
                              className="icon-button"
                              aria-label={`Excluir módulo ${m.title}`}
                              onClick={() =>
                                confirm(
                                  "Excluir este módulo e todos os seus tópicos?",
                                  () =>
                                    update((d) => ({
                                      ...d,
                                      tracks: d.tracks.map((t) =>
                                        t.id === activeTrack.id
                                          ? {
                                              ...t,
                                              modules: t.modules.filter(
                                                (md) => md.id !== m.id,
                                              ),
                                            }
                                          : t,
                                      ),
                                    })),
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        {m.topics.map((tp) => (
                          <details
                            key={tp.id}
                            id={`topic-${tp.id}`}
                            className="topic"
                            onToggle={(e) => {
                              if (e.currentTarget.open)
                                setOpenedTopics((old) =>
                                  old.has(tp.id)
                                    ? old
                                    : new Set([...old, tp.id]),
                                );
                            }}
                            open={undefined}
                          >
                            <summary>
                              {tp.done ? (
                                <CircleCheck size={18} />
                              ) : (
                                <Circle size={18} />
                              )}
                              <span>{tp.title}</span>
                              <ChevronRight size={16} />
                            </summary>
                            <div className="topic-content">
                              {openedTopics.has(tp.id) && (
                                <LessonGuide
                                  course={activeTrack.title}
                                  title={tp.title}
                                  exercise={tp.exercise}
                                  criteria={tp.criteria}
                                />
                              )}
                              {tp.resources.length > 0 && (
                                <div className="topic-label">
                                  Estude nesta ordem
                                </div>
                              )}
                              {tp.resources.map((r, i) => (
                                <div className="resource" key={`${r.url}-${i}`}>
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {i + 1}. {r.title}
                                    <ExternalLink size={13} />
                                  </a>
                                  <p>{r.why}</p>
                                </div>
                              ))}
                              <div className="inline-actions">
                                <Button
                                  secondary
                                  onClick={() =>
                                    open({
                                      kind: "topic",
                                      id: tp.id,
                                      trackId: activeTrack.id,
                                      moduleId: m.id,
                                    })
                                  }
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (
                                      !tp.done &&
                                      (!tp.criteria.trim() ||
                                        !tp.exercise.trim())
                                    ) {
                                      open({
                                        kind: "topic",
                                        id: tp.id,
                                        trackId: activeTrack.id,
                                        moduleId: m.id,
                                      });
                                      return;
                                    }
                                    if (!tp.done) {
                                      confirm(
                                        "Você realizou a prática e atende aos critérios descritos? Confirmar marca o tópico como concluído e agenda uma revisão.",
                                        () =>
                                          update((d) => ({
                                            ...d,
                                            tracks: d.tracks.map((t) => ({
                                              ...t,
                                              modules: t.modules.map((md) => ({
                                                ...md,
                                                topics: md.topics.map(
                                                  (topic) =>
                                                    topic.id === tp.id
                                                      ? {
                                                          ...topic,
                                                          done: true,
                                                          reviewed: false,
                                                          reviewDate:
                                                            topic.reviewDate ||
                                                            addDays(now, 7),
                                                        }
                                                      : topic,
                                                ),
                                              })),
                                            })),
                                          })),
                                      );
                                    } else
                                      change((d) => ({
                                        ...d,
                                        tracks: d.tracks.map((t) => ({
                                          ...t,
                                          modules: t.modules.map((md) => ({
                                            ...md,
                                            topics: md.topics.map((topic) =>
                                              topic.id === tp.id
                                                ? {
                                                    ...topic,
                                                    done: false,
                                                    reviewed: false,
                                                    reviewDate: null,
                                                  }
                                                : topic,
                                            ),
                                          })),
                                        })),
                                      }));
                                  }}
                                >
                                  {tp.done
                                    ? "Reabrir tópico"
                                    : "Concluir tópico"}
                                </Button>
                                <button
                                  className="icon-button danger-text"
                                  aria-label={`Excluir tópico ${tp.title}`}
                                  onClick={() =>
                                    confirm(
                                      "Excluir este tópico e seu progresso?",
                                      () =>
                                        update((d) => ({
                                          ...d,
                                          tracks: d.tracks.map((t) => ({
                                            ...t,
                                            modules: t.modules.map((md) => ({
                                              ...md,
                                              topics: md.topics.filter(
                                                (topic) => topic.id !== tp.id,
                                              ),
                                            })),
                                          })),
                                        })),
                                    )
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </details>
                        ))}
                        <button
                          className="text-button"
                          onClick={() =>
                            open({
                              kind: "topic",
                              trackId: activeTrack.id,
                              moduleId: m.id,
                            })
                          }
                        >
                          <Plus size={15} />
                          Adicionar tópico
                        </button>
                      </article>
                    ))}
                  </section>
                </div>
              )}
            </>
          )}
          {page === "Emprego" && (
            <>
              <JobSearch
                jobs={data.jobs}
                onSave={(vacancy) =>
                  open({
                    kind: "job",
                    jobDraft: {
                      role: vacancy.title,
                      url: vacancy.url,
                      notes: `Fonte: ${vacancy.source}. Publicada em ${formatDate(vacancy.publishedAt.slice(0, 10))}. Confira a empresa e as instruções no anúncio original.`,
                    },
                  })
                }
              />
              <div className="two-column">
                <div className="stack">
                  <section className="glass">
                    <span className="eyebrow">Foco de hoje</span>
                    <h2 className="feature-title">
                      {nextJob?.title || "Um passo na carreira."}
                    </h2>
                    <p>
                      {nextJob
                        ? `${nextJob.minutes} minutos para avançar.`
                        : "Salve oportunidades e transforme a busca em ações possíveis."}
                    </p>
                    <Button
                      onClick={() =>
                        nextJob
                          ? finish(nextJob)
                          : open({ kind: "task", area: "emprego" })
                      }
                    >
                      {nextJob ? "Concluir ação" : "Planejar ação profissional"}
                      <ArrowRight size={18} />
                    </Button>
                  </section>
                  <div className="stats">
                    {[
                      [
                        data.jobs.filter(
                          (j) =>
                            !["Rejeitada", "Contratada"].includes(j.status),
                        ).length,
                        "Em aberto",
                      ],
                      [
                        data.jobs.filter(
                          (j) => j.status === "Candidatura enviada",
                        ).length,
                        "Enviadas",
                      ],
                      [
                        data.jobs.filter((j) => j.status === "Entrevista")
                          .length,
                        "Entrevistas",
                      ],
                    ].map(([n, l]) => (
                      <div key={l}>
                        <strong>{n}</strong>
                        <small>{l}</small>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => open({ kind: "job" })}>
                    <Plus size={18} />
                    Salvar vaga
                  </Button>
                </div>
                <section>
                  <div className="section-heading">
                    <h2>Suas oportunidades</h2>
                  </div>
                  <Field label="Filtrar por status">
                    <select
                      value={jobFilter}
                      onChange={(e) => setJobFilter(e.target.value)}
                    >
                      <option>Todas</option>
                      {jobStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  {data.jobs.filter(
                    (j) => jobFilter === "Todas" || j.status === jobFilter,
                  ).length ? (
                    <div className="jobs">
                      {[...data.jobs]
                        .filter(
                          (j) =>
                            jobFilter === "Todas" || j.status === jobFilter,
                        )
                        .reverse()
                        .map((j) => (
                          <article className="glass job-card" key={j.id}>
                            <div className="section-heading">
                              <span className="muted small">{j.company}</span>
                              <div className="mini-actions">
                                {editButton("Editar vaga " + j.role, () =>
                                  open({ kind: "job", id: j.id }),
                                )}
                                <button
                                  className="icon-button"
                                  aria-label={`Excluir vaga ${j.role}`}
                                  onClick={() => remove("jobs", j.id)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                            <h3>{j.role}</h3>
                            <span className="badge">{j.status}</span>
                            <p className="small muted">
                              Registrada em {formatDate(j.date)}
                            </p>
                            {j.appliedAt && (
                              <p className="small muted">
                                Envio confirmado em{" "}
                                {new Date(j.appliedAt).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                            )}
                            {j.contact && (
                              <p className="small">Contato: {j.contact}</p>
                            )}
                            {j.notes && (
                              <p className="small notes">{j.notes}</p>
                            )}
                            <div className="job-actions">
                              <label
                                className="sr-only"
                                htmlFor={`status-${j.id}`}
                              >
                                Status de {j.role}
                              </label>
                              <select
                                id={`status-${j.id}`}
                                value={j.status}
                                onChange={(e) =>
                                  change((d) => ({
                                    ...d,
                                    jobs: d.jobs.map((job) =>
                                      job.id === j.id
                                        ? changeJobStatus(
                                            job,
                                            e.target.value as Job["status"],
                                          )
                                        : job,
                                    ),
                                  }))
                                }
                              >
                                {jobStatuses.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                              {j.url && (
                                <a
                                  className="text-button"
                                  href={j.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Abrir vaga
                                  <ArrowUpRight size={15} />
                                </a>
                              )}
                            </div>
                            {j.status === "Encontrada" && (
                              <button
                                className="text-button"
                                onClick={() =>
                                  confirm(
                                    "Você já concluiu o envio do currículo pelo canal indicado na vaga? Confirme apenas depois de enviar. Esta ação registra o envio no painel.",
                                    () =>
                                      update((d) => ({
                                        ...d,
                                        jobs: d.jobs.map((job) =>
                                          job.id === j.id
                                            ? changeJobStatus(
                                                job,
                                                "Candidatura enviada",
                                              )
                                            : job,
                                        ),
                                      })),
                                  )
                                }
                              >
                                Confirmar currículo enviado
                              </button>
                            )}
                          </article>
                        ))}
                    </div>
                  ) : (
                    <Empty
                      icon={BriefcaseBusiness}
                      title={
                        data.jobs.length
                          ? "Nenhuma vaga neste status"
                          : "Sua busca, organizada"
                      }
                    >
                      Salve empresa, cargo e link. Atualize o status quando der
                      o próximo passo.
                    </Empty>
                  )}
                </section>
              </div>
            </>
          )}
          {page === "Semana" && (
            <>
              <div className="week-toolbar">
                <button
                  className="icon-button"
                  aria-label="Semana anterior"
                  onClick={() => setDate(addDays(date, -7))}
                >
                  <ChevronLeft size={20} />
                </button>
                <strong aria-live="polite">
                  {formatDate(weekStart)} — {formatDate(addDays(weekStart, 6))}
                </strong>
                <button
                  className="icon-button"
                  aria-label="Próxima semana"
                  onClick={() => setDate(addDays(date, 7))}
                >
                  <ChevronRight size={20} />
                </button>
                <button className="text-button" onClick={() => setDate(now)}>
                  Hoje
                </button>
              </div>
              <div className="week-days">
                {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(
                  (day) => (
                    <button
                      key={day}
                      className={day === date ? "selected" : ""}
                      aria-pressed={day === date}
                      onClick={() => setDate(day)}
                    >
                      <small>
                        {formatDate(day, { weekday: "short" }).replace(".", "")}
                      </small>
                      <strong>{formatDate(day, { day: "2-digit" })}</strong>
                      <span
                        className={
                          data.tasks.some((t) => t.date === day)
                            ? "has-tasks"
                            : ""
                        }
                      />
                    </button>
                  ),
                )}
              </div>
              <div className="two-column">
                <div className="stack">
                  <section>
                    <div className="section-heading">
                      <h2>{formatDate(date, { weekday: "long" })}</h2>
                      <span>
                        {
                          data.tasks.filter(
                            (t) => t.date === date && t.status === "concluída",
                          ).length
                        }{" "}
                        concluídas
                      </span>
                    </div>
                    {(() => {
                      const mins = data.tasks
                        .filter((t) => t.date === date && t.status !== "pulada")
                        .reduce((s, t) => s + t.minutes, 0);
                      return (
                        <div className="capacity">
                          <p>
                            {mins} min planejados de{" "}
                            {data.settings.dailyMinutes} disponíveis
                          </p>
                          <Progress
                            value={mins}
                            max={data.settings.dailyMinutes}
                            label="Tempo planejado"
                          />
                          <small>
                            {mins > data.settings.dailyMinutes
                              ? "O dia está cheio. Considere reagendar uma ação."
                              : "Deixe espaço para pausas e imprevistos."}
                          </small>
                        </div>
                      );
                    })()}
                    {data.tasks.some((t) => t.date === date) ? (
                      taskList(data.tasks.filter((t) => t.date === date))
                    ) : (
                      <Empty title="Espaço para o essencial">
                        Escolha tarefas que caibam no seu dia.
                      </Empty>
                    )}
                    <Button
                      secondary
                      onClick={() => open({ kind: "task", date })}
                    >
                      <Plus size={18} />
                      Adicionar tarefa
                    </Button>
                  </section>
                  <section>
                    <div className="section-heading">
                      <h2>Histórico de reagendamentos</h2>
                    </div>
                    {data.tasks
                      .flatMap((t) =>
                        t.history
                          .filter(
                            (h) =>
                              h.action === "reagendada" &&
                              ((h.from >= weekStart &&
                                h.from < addDays(weekStart, 7)) ||
                                (h.to >= weekStart &&
                                  h.to < addDays(weekStart, 7))),
                          )
                          .map((h, i) => (
                            <div className="history-row" key={`${t.id}-${i}`}>
                              <RotateCcw size={16} />
                              <div>
                                <strong>{t.title}</strong>
                                <small>
                                  {formatDate(h.from)} → {formatDate(h.to)}
                                </small>
                              </div>
                            </div>
                          )),
                      )
                      .reverse()
                      .slice(0, 15)}
                    {!data.tasks.some((t) =>
                      t.history.some(
                        (h) =>
                          h.action === "reagendada" &&
                          ((h.from >= weekStart &&
                            h.from < addDays(weekStart, 7)) ||
                            (h.to >= weekStart &&
                              h.to < addDays(weekStart, 7))),
                      ),
                    ) && (
                      <p className="muted">
                        Reagendamentos desta semana aparecerão aqui, sem apagar
                        as datas anteriores.
                      </p>
                    )}
                  </section>
                </div>
                <section>
                  <div className="section-heading">
                    <h2>Objetivos e metas</h2>
                    <button
                      className="text-button"
                      onClick={() => open({ kind: "goal" })}
                    >
                      <Plus size={16} />
                      Objetivo
                    </button>
                  </div>
                  {data.goals.length ? (
                    <div className="stack small-gap">
                      {data.goals.map((g) => (
                        <article className="glass goal-card" key={g.id}>
                          <div className="section-heading">
                            <span className="eyebrow">{areaName[g.area]}</span>
                            <div className="mini-actions">
                              {editButton("Editar objetivo " + g.title, () =>
                                open({ kind: "goal", id: g.id }),
                              )}
                              <button
                                className="icon-button"
                                aria-label={`Excluir objetivo ${g.title}`}
                                onClick={() => remove("goals", g.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                          <h3>{g.title}</h3>
                          <p>
                            <span className="muted">Nesta semana:</span>{" "}
                            {g.weeklyTarget}
                          </p>
                          {g.deadline && (
                            <p className="small muted">
                              Prazo: {formatDate(g.deadline)}
                            </p>
                          )}
                          <button
                            className="text-button"
                            onClick={() =>
                              change((d) => ({
                                ...d,
                                goals: d.goals.map((goal) =>
                                  goal.id === g.id
                                    ? { ...goal, done: !goal.done }
                                    : goal,
                                ),
                              }))
                            }
                          >
                            {g.done ? (
                              <>
                                <CircleCheck size={17} />
                                Concluído · reabrir
                              </>
                            ) : (
                              <>
                                <Circle size={17} />
                                Marcar objetivo concluído
                              </>
                            )}
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Empty icon={Target} title="Dê uma direção à semana">
                      Defina um objetivo e uma meta semanal. Depois, vincule
                      suas tarefas a ele.
                    </Empty>
                  )}
                </section>
              </div>
            </>
          )}
          {page === "Notícias" && <NewsPage />}
          <footer className="page-footer">
            <span>Dados neste aparelho</span>
            <a href="https://lordicon.com/" target="_blank" rel="noopener noreferrer">Ícones animados por Lordicon.com</a>
          </footer>
        </main>
      </div>
      <nav
        className="bottom-nav"
        data-icon-motion={iconMotion ? "on" : "off"}
        aria-label="Navegação principal"
        style={{ "--nav-count": navigation.length } as CSSProperties}
      >
        <span
          className="nav-indicator"
          aria-hidden="true"
          style={{
            transform: `translateX(${navigation.indexOf(page) * 100}%)`,
          }}
        />
        {navigation.map((label) => (
          <button
            key={label}
            className={page === label ? "active" : ""}
            data-nav={label}
            aria-current={page === label ? "page" : undefined}
            onClick={() => switchPage(label)}
          >
            <span
              className="nav-glyph"
              key={page === label ? `${label}-${navPulse}` : label}
              aria-hidden="true"
            >
              <AnimatedIcon name={label} active={page === label} motion={iconMotion} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {backupInput()}
      {renderEditor()}
      {voiceOpen && (
        <Modal title="Seu comando, sua ação" close={() => setVoiceOpen(false)}>
          <VoiceCommand
            data={data}
            onChange={change}
            close={() => setVoiceOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
