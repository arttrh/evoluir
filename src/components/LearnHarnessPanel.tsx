import { useEffect, useId, useState } from "react";
import { z } from "zod";
import type { Track } from "../model";

const linkSchema = z.object({ trackId: z.string(), topicId: z.string() });
const resultSchema = z.object({ syncedAt: z.iso.datetime(), sessions: z.array(z.object({
  id: z.string().max(100), title: z.string().max(10000), kind: z.enum(["teach", "practice"]).default("teach"), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
  link: linkSchema.nullable(), topics: z.array(z.object({ id: z.string(), title: z.string(), status: z.enum(["current", "visited", "upcoming"]) })).max(1000),
})).max(1000) });
const labels = { current: "Atual", visited: "Visitado", upcoming: "Futuro" };
export function LearnHarnessPanel({ tracks }: { tracks: Track[] }) {
  const id = useId();
  const [result, setResult] = useState<z.infer<typeof resultSchema>>();
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  async function synchronize(signal?: AbortSignal) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/learning", { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000), cache: "no-store" });
      if (!response.ok) throw new Error();
      const next = resultSchema.parse(await response.json());
      if (!signal?.aborted) setResult(next);
    } catch { if (!signal?.aborted) setError("Não foi possível sincronizar. O serviço pode estar iniciando; aguarde um minuto e atualize. Seus registros anteriores foram preservados."); }
    finally { if (!signal?.aborted) setBusy(false); }
  }
  useEffect(() => { const controller = new AbortController(); void synchronize(controller.signal); return () => controller.abort(); }, []);
  async function associate(sessionId: string, value: string) {
    const [trackId, topicId] = value.split("/");
    if (!trackId || !topicId) return;
    setSaving(sessionId); setError("");
    try {
      const response = await fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, trackId, topicId }), signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error();
      await synchronize();
    } catch { setError("O vínculo não foi confirmado. Atualize para conferir antes de tentar novamente."); }
    finally { setSaving(""); }
  }
  return <section className="panel learning-panel" aria-labelledby={`${id}-title`} aria-busy={busy}>
    <div className="section-heading"><h2 id={`${id}-title`}>Sessões no LearnHarness</h2><button className="button secondary" disabled={busy || Boolean(saving)} onClick={() => void synchronize()}>{busy ? "Sincronizando…" : "Atualizar"}</button></div>
    <p className="muted">Estude online e vincule suas sessões às trilhas. Visitar um assunto não o marca como aprendido.</p>
    <a className="button" href="/api/learning?op=open" target="_blank" rel="noopener noreferrer">Abrir LearnHarness <span className="sr-only">em outra aba</span></a>
    <div aria-live="polite">{result && <p className="small muted">Última sincronização: <time dateTime={result.syncedAt}>{new Date(result.syncedAt).toLocaleString("pt-BR")}</time></p>}{busy && <p role="status">Consultando seus estudos…</p>}</div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {!busy && !error && result?.sessions.length === 0 && <p>Ainda não há sessões. Abra o LearnHarness para começar.</p>}
    <div className="stack">{result?.sessions.map(session => {
      const linked = tracks.find(track => track.id === session.link?.trackId)?.modules.flatMap(module => module.topics).find(topic => topic.id === session.link?.topicId);
      return <article className="learning-session" key={session.id}>
      <h3>{session.title}</h3>
      <p className="small muted">{session.kind === "practice" ? "Prática" : "Estudo"} · Atividade registrada em {new Date(session.updatedAt).toLocaleString("pt-BR")}</p>
      <label className="field">Vincular a um tópico
        <select aria-label={`Tópico de ${session.title}`} disabled={Boolean(saving) || tracks.length === 0} value={session.link ? `${session.link.trackId}/${session.link.topicId}` : ""} onChange={event => void associate(session.id, event.target.value)}>
          <option value="">Escolha uma trilha e um tópico</option>
          {session.link && !tracks.some(track => track.id === session.link?.trackId && track.modules.some(module => module.topics.some(topic => topic.id === session.link?.topicId))) && <option value={`${session.link.trackId}/${session.link.topicId}`}>Vínculo salvo em outro aparelho</option>}
          {tracks.map(track => <optgroup key={track.id} label={track.title}>{track.modules.flatMap(module => module.topics.map(topic => <option key={topic.id} value={`${track.id}/${topic.id}`}>{module.title} · {topic.title}</option>))}</optgroup>)}
        </select>
      </label>
      {tracks.length === 0 && <p className="small muted">Crie uma trilha no Prumo para vincular a sessão.</p>}
      {linked && <p className="small muted">Revisão no Prumo: {linked.reviewed ? "registrada" : linked.reviewDate ? `agendada para ${new Date(linked.reviewDate + "T12:00:00").toLocaleDateString("pt-BR")}` : "não agendada"}.</p>}
      {session.topics.length > 0 ? <ul>{session.topics.map(topic => <li key={topic.id}><span>{topic.title}</span> <small>{labels[topic.status]}</small></li>)}</ul> : <p className="small muted">Esta sessão ainda não tem assuntos planejados.</p>}
    </article>; })}</div>
  </section>;
}
