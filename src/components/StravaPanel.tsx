import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, RefreshCw, Link2, Unplug, Activity, CircleCheck } from "lucide-react";
import { z } from "zod";
import { duration, pace } from "../model";
const responseSchema = z.object({
  activities: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
      distance: z.number(),
      movingTime: z.number(),
      elapsedTime: z.number(),
      date: z.iso.datetime(),
      elevation: z.number().nullable(),
      heartRate: z.number().nullable(),
      device: z.string().nullable(),
      url: z.string().url(),
    }),
  ).max(100),
  checkedAt: z.iso.datetime().optional(),
});
const visible = (): boolean => document.visibilityState === "visible";
export function StravaPanel() {
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
  } | null>(null);
  const [activities, setActivities] = useState<
    z.infer<typeof responseSchema>["activities"]
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");
  const request = useRef<AbortController | null>(null);
  const revoking = useRef(false);
  useEffect(() => {
    let active = true;
    fetch("/api/strava?op=status", { cache: "no-store", signal: AbortSignal.timeout(20000) })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((s) => {
        const value = z
          .object({ configured: z.boolean(), connected: z.boolean() })
          .parse(s);
        if (active) setStatus(value);
      })
      .catch(() => {
        if (active)
          setError("Não foi possível verificar a conexão Strava agora.");
      });
    return () => {
      active = false;
    };
  }, []);
  const load = useCallback(async () => {
    if (!visible() || revoking.current) return;
    request.current?.abort();
    const abort = new AbortController();
    request.current = abort;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/strava?op=activities", {
        cache: "no-store",
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(20000)]),
      });
      if (abort.signal.aborted) return;
      if (!response.ok) {
        const body = await response.json();
        if (response.status === 401) {
          setActivities([]);
          setStatus((s) => (s ? { ...s, connected: false } : s));
        }
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Falha ao consultar atividades.",
        );
      }
      const data = responseSchema.parse(await response.json());
      if (!abort.signal.aborted && visible()) {
        setActivities([...new Map(data.activities.map(activity => [activity.id, activity])).values()]);
        setCheckedAt(data.checkedAt || new Date().toISOString());
      }
    } catch (e) {
      if (abort.signal.aborted) return;
      setActivities([]);
      setCheckedAt("");
      setError(e instanceof Error ? e.message : "Não foi possível consultar.");
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (!status?.connected) return;
    const synchronize = () => {
      if (!visible()) {
        request.current?.abort();
        setActivities([]);
        setCheckedAt("");
        if (!revoking.current) setBusy(false);
      } else void load();
    };
    void load();
    document.addEventListener("visibilitychange", synchronize);
    const timer = setInterval(() => { if (visible()) void load(); }, 300000);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", synchronize);
      request.current?.abort();
    };
  }, [status?.connected, load]);
  async function disconnect() {
    revoking.current = true;
    request.current?.abort();
    setActivities([]);
    setCheckedAt("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/strava?op=disconnect", {
        method: "POST",
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw new Error(
          "A revogação falhou. Tente novamente ou remova o Prumo em Strava → Configurações → Meus aplicativos.",
        );
      setActivities([]);
      setStatus({ configured: true, connected: false });
      setDisconnecting(false);
      setError(
        "Conexão revogada. As corridas do Strava foram removidas desta tela; seus registros manuais foram preservados.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível desconectar.",
      );
    } finally {
      revoking.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="glass strava-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Seus dados de corrida</span>
          <h2>Corridas realizadas no Strava</h2>
        </div>
        <span className="explorer-icon">
          <Activity size={23} />
        </span>
      </div>
      <p className="muted small">
        Conecte o NRC ao Strava para enviar as próximas corridas. O histórico
        anterior não é transferido por essa conexão.
      </p>
      {status === null ? <p role="status" className="small muted">{error ? "Atualize a página para verificar sua conexão novamente." : "Verificando sua conexão Strava…"}</p> : status.connected ? (
        <>
          <div className="connected-badge">
            <span className="status-dot" />
            Strava conectado · atualização automática
          </div>
          <div className="inline-actions">
            <button className="button" disabled={busy} onClick={() => void load()}>
              <RefreshCw size={16} className={busy ? "spin" : ""} />
              {busy ? "Consultando" : "Atualizar corridas"}
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setDisconnecting((v) => !v)}
            >
              <Unplug size={15} />
              Desconectar
            </button>
          </div>
          {disconnecting && (
            <div className="planning-note">
              <p>Revogar o acesso do Prumo ao Strava?</p>
              <button
                className="text-button"
                onClick={disconnect}
                disabled={busy}
              >
                Confirmar desconexão
              </button>
            </div>
          )}
          {busy && <p role="status" className="small muted">Atualizando suas corridas…</p>}
          {checkedAt && <p className="small muted">Última atualização: <time dateTime={checkedAt}>{new Date(checkedAt).toLocaleString("pt-BR")}</time></p>}
          {activities.map((a) => (
            <article className="external-run" key={a.id}>
              <span className="strava-completed"><CircleCheck size={15} /> Realizada no Strava</span>
              <div className="section-heading">
                <h3>{a.name}</h3>
                <a
                  aria-label={`Ver ${a.name} no Strava`}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <p className="small muted">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(a.date))}
              </p>
              <div className="external-metrics">
                <span>
                  <strong>
                    {(a.distance / 1000).toLocaleString("pt-BR", {
                      maximumFractionDigits: 2,
                    })}
                  </strong>{" "}
                  km
                </span>
                <span>{duration(a.movingTime)}</span>
                <span>{pace(a.movingTime, a.distance / 1000)} /km</span>
              </div>
              <p className="small muted">
                {a.elevation !== null ? `${a.elevation} m de elevação` : ""}
                {a.heartRate !== null
                  ? ` · FC média ${Math.round(a.heartRate)} bpm`
                  : ""}
                {a.device ? ` · ${a.device}` : ""}
              </p>
              <a
                className="text-button"
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver no Strava
                <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
          {activities.length === 0 && !busy && !error && checkedAt && (
            <p className="small muted">
              Nenhuma corrida encontrada entre suas 100 atividades mais recentes no Strava.
            </p>
          )}
        </>
      ) : (
        <>
          {status?.configured ? (
            <>
              <label className="integration-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Autorizo a consulta das minhas corridas, incluindo privadas,
                  para exibi-las apenas para mim. Posso revogar a conexão a
                  qualquer momento.
                </span>
              </label>
              <button
                className="button"
                disabled={!consent}
                onClick={() => window.location.assign("/api/strava?op=connect")}
              >
                <Link2 size={17} />
                Conectar minha conta Strava
              </button>
            </>
          ) : (
            <div className="integration-state">
              <span>Conexão automática ainda não ativada</span>
              <p>
                A criação do aplicativo de API exige assinatura Strava. Essa
                conexão é opcional; seus registros manuais continuam funcionando
                sem contratar um plano.
              </p>
              <a
                href="/conectar-strava.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver como ativar a conexão
              </a>
            </div>
          )}
          <details className="help">
            <summary>Como conectar o Nike ao Strava</summary>
            <ol>
              <li>
                No Nike Run Club, abra Perfil → Configurações → Parceiros.
              </li>
              <li>Selecione Strava e autorize a conexão.</li>
              <li>
                As corridas registradas depois dessa autorização poderão
                aparecer no Strava.
              </li>
            </ol>
            <a
              href="https://support.strava.com/en-us/articles/15401850-nike-and-strava"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar instruções oficiais
              <ArrowUpRight size={13} />
            </a>
          </details>
        </>
      )}
      {error && (
        <p className="planning-note" role="status">
          {error}
        </p>
      )}
      <p className="integration-privacy">
        Suas corridas aparecem automaticamente ao abrir esta tela e ao voltar
        para ela. Enquanto a tela estiver visível, a consulta é atualizada a cada cinco minutos.
        Os dados do Strava não entram no backup nem alteram suas metas manuais.{" "}
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
          Privacidade
        </a>{" "}
        ·{" "}
        <a
          href="https://www.strava.com/settings/apps"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gerenciar acesso no Strava
        </a>
      </p>
    </section>
  );
}
