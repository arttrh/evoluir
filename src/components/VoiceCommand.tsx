import { useEffect, useRef, useState } from "react";
import { Mic, Square, Check, ArrowRight, RotateCcw } from "lucide-react";
import { parseCommand } from "../voice";
import { assembleSpeech, type SpeechResult } from "../speech";
import {
  type Data,
  type Run,
  transitionTask,
  saveRun,
  uid,
  today,
  pace,
  addDays,
} from "../model";
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
  stop: () => void;
};
function recognitionConstructor() {
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}
export function VoiceCommand({
  data,
  onChange,
  close,
}: {
  data: Data;
  onChange: (f: (d: Data) => Data) => boolean;
  close: () => void;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [selected, setSelected] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef("");
  const active = useRef(false);
  const disposed = useRef(false);
  const prefix = useRef("");
  const started = useRef(0);
  const restarts = useRef(0);
  useEffect(() => {
    disposed.current = false;
    const hide = () => {
      if (document.visibilityState === "hidden") {
        active.current = false;
        recognition.current?.abort();
        setListening(false);
        setFinishing(false);
        if (current.current.trim()) setReview(true);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      disposed.current = true;
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
      recognition.current?.abort();
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  const intent = review ? parseCommand(text, data.tasks, data.tracks) : null;
  const candidates =
    intent?.kind === "complete"
      ? data.tasks.filter((t) => intent.taskIds.includes(t.id))
      : [];
  const topics =
    intent?.kind === "study"
      ? data.tracks
          .flatMap((t) =>
            t.modules.flatMap((m) =>
              m.topics.map((tp) => ({ ...tp, track: t.title })),
            ),
          )
          .filter((t) => intent.topicIds.includes(t.id))
      : [];
  const studySelected =
    intent?.kind === "study"
      ? selected ||
        intent.suggestedTopicId ||
        (topics.length === 1 ? topics[0].id : "")
      : "";
  const chosenTopic = topics.find((t) => t.id === studySelected);
  function finish() {
    if (disposed.current) return;
    active.current = false;
    const speech = recognition.current;
    recognition.current = null;
    speech?.abort();
    setListening(false);
    setFinishing(false);
    setText(current.current);
    setReview(Boolean(current.current.trim()));
    if (timer.current) clearTimeout(timer.current);
    if (finishTimer.current) clearTimeout(finishTimer.current);
  }
  function stop() {
    active.current = false;
    setFinishing(true);
    finishTimer.current = setTimeout(finish, 800);
    try {
      recognition.current?.stop();
    } catch {
      finish();
    }
  }
  function listen(append = false) {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (timer.current) clearTimeout(timer.current);
    const old = recognition.current;
    recognition.current = null;
    old?.abort();
    current.current = append ? text : "";
    prefix.current = current.current;
    setText(current.current);
    setAlternatives([]);
    setError("");
    setReview(false);
    setSelected("");
    setListening(true);
    setFinishing(false);
    active.current = true;
    started.current = Date.now();
    restarts.current = 0;
    const speech = new Constructor();
    recognition.current = speech;
    speech.lang = "pt-BR";
    speech.continuous = true;
    speech.interimResults = true;
    speech.maxAlternatives = 3;
    speech.onresult = (e) => {
      if (disposed.current || recognition.current !== speech) return;
      const result = assembleSpeech(e.results, prefix.current);
      current.current = result.text;
      setText(result.text);
      setAlternatives(result.alternatives);
    };
    speech.onerror = (e) => {
      if (disposed.current || recognition.current !== speech) return;
      active.current = false;
      setError(
        e.error === "not-allowed"
          ? "Permita o microfone nas configurações do navegador ou use o ditado do teclado."
          : e.error === "no-speech"
            ? "Não ouvi uma frase. Você pode continuar o ditado ou editar o texto."
            : "O serviço de voz foi interrompido. Seu texto foi preservado; continue o ditado ou corrija abaixo.",
      );
      finish();
    };
    speech.onend = () => {
      if (disposed.current || recognition.current !== speech) return;
      if (
        active.current &&
        Date.now() - started.current < 60000 &&
        restarts.current < 3
      ) {
        prefix.current = current.current;
        restarts.current++;
        try {
          speech.start();
          return;
        } catch {
          setError(
            "O navegador pausou o microfone. Toque em continuar ditado para retomar.",
          );
        }
      }
      finish();
    };
    try {
      speech.start();
      if (active.current) timer.current = setTimeout(stop, 60000);
    } catch {
      active.current = false;
      finish();
      setError(
        "Não foi possível iniciar. Use o ditado do teclado ou digite o comando.",
      );
    }
  }
  function apply() {
    if (!intent || listening || finishing) return;
    if (intent.kind === "run") {
      const run: Run = {
        id: uid(),
        date: today(),
        distance: intent.distance,
        seconds: intent.seconds,
        notes: "Registrada por comando de voz.",
        taskId: selected || null,
      };
      if (onChange((d) => saveRun(d, run))) close();
    } else if (intent.kind === "complete") {
      const id = selected || (candidates.length === 1 ? candidates[0].id : "");
      const task = data.tasks.find((t) => t.id === id);
      if (!task) return;
      if (task.area === "corpo") {
        setError(
          "Para concluir um treino, informe distância e duração: “Corri 5 km em 35 minutos”.",
        );
        return;
      }
      if (
        onChange((d) => ({
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === id && t.status === "pendente"
              ? transitionTask(t, "concluída")
              : t,
          ),
        }))
      )
        close();
    } else if (intent.kind === "study") {
      const id = studySelected;
      if (!id) return;
      if (
        onChange((d) => ({
          ...d,
          tracks: d.tracks.map((t) => ({
            ...t,
            modules: t.modules.map((m) => ({
              ...m,
              topics: m.topics.map((tp) =>
                tp.id === id
                  ? {
                      ...tp,
                      done: true,
                      reviewed: false,
                      reviewDate: tp.reviewDate || addDays(today(), 7),
                    }
                  : tp,
              ),
            })),
          })),
        }))
      )
        close();
    }
  }
  return (
    <div className="voice-command voice-compact">
      <p className="dialog-description">
        Corrida, estudos e emprego. Fale, confira o texto e confirme a ação.
      </p>
      <div className="voice-controls">
        <button
          className="button voice-start"
          disabled={finishing || !recognitionConstructor()}
          onClick={() => (listening ? stop() : listen(Boolean(text.trim())))}
        >
          {listening ? (
            <>
              <Square size={16} />
              {finishing ? "Concluindo escuta…" : "Parar e conferir"}
            </>
          ) : (
            <>
              <Mic size={17} />
              {text.trim() ? "Continuar ditado" : "Falar comando"}
            </>
          )}
        </button>
        {!listening && text.trim() && (
          <button
            className="icon-button"
            aria-label="Regravar do início"
            onClick={() => listen(false)}
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
      {!recognitionConstructor() && (
        <p className="voice-fallback">
          Use o microfone do teclado do iPhone no campo abaixo; o navegador não
          oferece escuta direta.
        </p>
      )}
      {listening && (
        <p className="listening-status" role="status">
          <span />
          Ouvindo… você pode fazer pausas. Até 60 segundos.
        </p>
      )}
      <label className="field">
        <span>Seu comando</span>
        <textarea
          aria-label="Seu comando"
          aria-describedby="voice-help"
          rows={3}
          value={text}
          readOnly={listening || finishing}
          onChange={(e) => {
            setText(e.target.value);
            current.current = e.target.value;
            setReview(false);
            setSelected("");
          }}
          placeholder="Terminei de estudar Java. Corri 5 km em 35 minutos…"
          maxLength={1000}
        />
        <small id="voice-help">
          {listening
            ? "A transcrição aparece enquanto você fala."
            : "Pode corrigir qualquer palavra antes de confirmar."}
        </small>
      </label>
      {!listening && alternatives.length > 1 && (
        <label className="field">
          <span>Outra transcrição do navegador</span>
          <select
            value={alternatives.includes(text) ? text : ""}
            onChange={(e) => {
              setText(e.target.value);
              current.current = e.target.value;
              setReview(false);
              setSelected("");
            }}
          >
            {!alternatives.includes(text) && (
              <option value="">Texto editado</option>
            )}
            {alternatives.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        className="text-button"
        disabled={!text.trim() || listening || finishing}
        onClick={() => {
          setReview(true);
          setError("");
        }}
      >
        Interpretar comando
        <ArrowRight size={15} />
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {intent?.kind === "unknown" && (
        <p className="planning-note" role="status">
          {intent.reason}
        </p>
      )}
      {intent && intent.kind !== "unknown" && (
        <div className="command-preview">
          <span className="eyebrow">Confira antes de salvar</span>
          {intent.kind === "run" ? (
            <>
              <h3>
                {intent.distance} km · {Math.round(intent.seconds / 60)} min
              </h3>
              <p>Ritmo: {pace(intent.seconds, intent.distance)} /km · hoje</p>
              <label className="field">
                <span>Concluir também um treino?</span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Apenas registrar corrida</option>
                  {data.tasks
                    .filter(
                      (t) => t.area === "corpo" && t.status === "pendente",
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </label>
            </>
          ) : intent.kind === "complete" ? (
            <>
              {candidates.length === 1 ? (
                <h3>{candidates[0].title}</h3>
              ) : (
                <label className="field">
                  <span>Qual tarefa você concluiu?</span>
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Selecione a tarefa</option>
                    {candidates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p>A tarefa será marcada como concluída.</p>
            </>
          ) : (
            <>
              {intent.courseTitle && (
                <p>
                  Trilha: <strong>{intent.courseTitle}</strong>. O próximo
                  tópico está sugerido; confira ou escolha outro.
                </p>
              )}
              {topics.length === 1 ? (
                <>
                  <h3>{topics[0].title}</h3>
                  <p>{topics[0].criteria}</p>
                </>
              ) : (
                <label className="field">
                  <span>Qual tópico você concluiu?</span>
                  <select
                    value={studySelected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Selecione o tópico</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} · {t.track}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {topics.length > 1 && chosenTopic && (
                <p>
                  <strong>Critério:</strong> {chosenTopic.criteria}
                </p>
              )}
              <p>
                Confirme somente se atende aos critérios do tópico. Uma revisão
                será agendada.
              </p>
            </>
          )}
          <div className="voice-confirm">
            <button
              className="button"
              disabled={
                listening ||
                finishing ||
                ((intent.kind === "complete"
                  ? candidates.length
                  : intent.kind === "study"
                    ? topics.length
                    : 1) > 1 &&
                  !(intent.kind === "study" ? studySelected : selected))
              }
              onClick={apply}
            >
              <Check size={17} />
              {intent.kind === "run"
                ? "Confirmar corrida"
                : intent.kind === "study"
                  ? "Confirmar tópico"
                  : "Confirmar conclusão"}
            </button>
          </div>
        </div>
      )}
      <details className="help">
        <summary>Exemplos e privacidade do microfone</summary>
        <p>
          “Terminei de estudar Java”, “Enviei as candidaturas”, “Concluí o
          tópico Service Discovery”, “Corri cinco quilômetros em trinta e cinco
          minutos”. Uma ação por vez. O serviço do navegador pode processar
          áudio online; o Prumo não grava áudio nem escuta em segundo plano.
        </p>
      </details>
    </div>
  );
}
