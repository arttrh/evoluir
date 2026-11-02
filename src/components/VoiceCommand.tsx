import { useEffect, useRef, useState } from "react";
import { Mic, Square, Check, ArrowRight } from "lucide-react";
import { parseCommand } from "../voice";
import {
  type Data,
  type Run,
  transitionTask,
  saveRun,
  uid,
  today,
  pace,
} from "../model";
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
        results: { isFinal: boolean; 0: { transcript: string } }[];
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
  stop: () => void;
};
const recognitionConstructor = () => {
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
};
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
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [selected, setSelected] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      recognition.current?.abort();
    },
    [],
  );
  const intent = review ? parseCommand(text, data.tasks) : null;
  const candidates =
    intent?.kind === "complete"
      ? data.tasks.filter((t) => intent.taskIds.includes(t.id))
      : [];
  function listen() {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    setError("");
    setReview(false);
    setListening(true);
    const speech = new Constructor();
    recognition.current = speech;
    speech.lang = "pt-BR";
    speech.continuous = false;
    speech.interimResults = false;
    speech.onresult = (e) => {
      const result = e.results[0]?.[0]?.transcript;
      if (result) {
        setText(result);
        setSelected("");
        setReview(true);
      }
    };
    speech.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Permita o microfone nas configurações do navegador ou use o ditado do teclado."
          : e.error === "no-speech"
            ? "Não ouvi uma frase. Tente novamente."
            : "O reconhecimento não está disponível agora. Use o ditado do teclado ou digite o comando.",
      );
    };
    speech.onend = () => {
      setListening(false);
      if (timer.current) clearTimeout(timer.current);
    };
    try {
      speech.start();
      timer.current = setTimeout(() => speech.stop(), 15000);
    } catch {
      setListening(false);
      setError("Não foi possível iniciar. Tente o ditado do teclado.");
    }
  }
  function apply() {
    if (!intent) return;
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
      if (!id) return;
      const task = data.tasks.find((t) => t.id === id);
      if (!task || task.area === "corpo") {
        setError(
          "Para concluir um treino, informe também distância e duração: “Corri 5 km em 35 minutos”.",
        );
        return;
      }
      if (
        onChange((d) => ({
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === id ? transitionTask(t, "concluída") : t,
          ),
        }))
      )
        close();
    }
  }
  return (
    <div className="voice-command">
      <p className="dialog-description">
        Fale uma vez, confira e confirme. O microfone só é ativado ao tocar no
        botão.
      </p>
      <div
        className={`voice-orb ${listening ? "listening" : ""}`}
        aria-hidden="true"
      >
        <Mic size={30} />
        <span />
        <span />
      </div>
      {recognitionConstructor() ? (
        <button
          className="button voice-start"
          onClick={() => (listening ? recognition.current?.stop() : listen())}
        >
          {listening ? (
            <>
              <Square size={16} />
              Parar de ouvir
            </>
          ) : (
            <>
              <Mic size={17} />
              Falar comando
            </>
          )}
        </button>
      ) : (
        <p className="voice-fallback">
          Neste navegador, use o microfone do teclado do iPhone no campo abaixo.
        </p>
      )}
      <label className="field">
        <span>Seu comando</span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setReview(false);
            setSelected("");
          }}
          placeholder="Corri 5 km em 35 minutos"
          maxLength={500}
        />
      </label>
      <button
        className="text-button"
        disabled={!text.trim() || listening}
        onClick={() => {
          setReview(true);
          setError("");
        }}
      >
        Interpretar comando
        <ArrowRight size={15} />
      </button>
      {listening && <p role="status">Ouvindo… diga uma frase curta.</p>}
      {intent?.kind === "unknown" && (
        <p className="planning-note" role="status">
          {intent.reason}
        </p>
      )}
      {intent?.kind === "run" && (
        <div className="command-preview">
          <span className="eyebrow">Confira o registro</span>
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
                .filter((t) => t.area === "corpo" && t.status === "pendente")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </label>
          <button className="button" onClick={apply}>
            <Check size={17} />
            Confirmar corrida
          </button>
        </div>
      )}
      {intent?.kind === "complete" && (
        <div className="command-preview">
          <span className="eyebrow">Confira a tarefa</span>
          {candidates.length === 1 ? (
            <h3>{candidates[0].title}</h3>
          ) : (
            <label className="field">
              <span>Encontrei mais de uma. Qual tarefa?</span>
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
          <button
            className="button"
            disabled={candidates.length > 1 && !selected}
            onClick={apply}
          >
            <Check size={17} />
            Confirmar conclusão
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="muted small">
        Exemplos: “Concluí revisar currículo” · “Corri cinco quilômetros em
        trinta minutos”. O serviço de voz do navegador pode processar áudio
        online. O Evoluir não grava seu áudio.
      </p>
    </div>
  );
}
