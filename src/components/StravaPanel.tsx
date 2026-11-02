import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, Link2, Unplug, Activity } from "lucide-react";
import { z } from "zod";
import { duration, pace } from "../model";
const responseSchema = z.object({
  activities: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      distance: z.number(),
      movingTime: z.number(),
      elapsedTime: z.number(),
      date: z.string(),
      elevation: z.number().nullable(),
      heartRate: z.number().nullable(),
      device: z.string().nullable(),
      url: z.string().url(),
    }),
  ),
});
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
  useEffect(() => {
    let active = true;
    fetch("/api/strava?op=status", { cache: "no-store" })
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
  async function load() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/strava?op=activities", {
        cache: "no-store",
      });
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
      setActivities(responseSchema.parse(await response.json()).activities);
    } catch (e) {
      setActivities([]);
      setError(e instanceof Error ? e.message : "Não foi possível consultar.");
    } finally {
      setBusy(false);
    }
  }
  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/strava?op=disconnect", {
        method: "POST",
      });
      if (!response.ok)
        throw new Error(
          "A revogação falhou. Tente novamente ou remova o Evoluir em Strava → Configurações → Meus aplicativos.",
        );
      setActivities([]);
      setStatus({ configured: true, connected: false });
      setDisconnecting(false);
      setError(
        "Conexão revogada. Nenhuma atividade do Strava foi salva no Evoluir.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível desconectar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="glass strava-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Seus dados de corrida</span>
          <h2>Nike Run Club + Strava</h2>
        </div>
        <span className="explorer-icon">
          <Activity size={23} />
        </span>
      </div>
      <p className="muted small">
        Conecte o NRC ao Strava para enviar as próximas corridas. O histórico
        anterior não é transferido por essa conexão.
      </p>
      {status?.connected ? (
        <>
          <div className="connected-badge">
            <span className="status-dot" />
            Strava conectado · consulta privada
          </div>
          <div className="inline-actions">
            <button className="button" disabled={busy} onClick={load}>
              <RefreshCw size={16} className={busy ? "spin" : ""} />
              {busy ? "Consultando" : "Consultar corridas"}
            </button>
            <button
              className="text-button"
              onClick={() => setDisconnecting((v) => !v)}
            >
              <Unplug size={15} />
              Desconectar
            </button>
          </div>
          {disconnecting && (
            <div className="planning-note">
              <p>Revogar o acesso do Evoluir ao Strava?</p>
              <button
                className="text-button"
                onClick={disconnect}
                disabled={busy}
              >
                Confirmar desconexão
              </button>
            </div>
          )}
          {activities.map((a) => (
            <article className="external-run" key={a.id}>
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
          {activities.length === 0 && !busy && (
            <p className="small muted">
              Consulte para ver as corridas entre suas 100 atividades mais
              recentes.
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
                O acesso depende do cadastro do Evoluir no Strava. Seus
                registros manuais continuam funcionando.
              </p>
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
        As atividades consultadas ficam apenas na memória desta tela. Não entram
        nos backups nem alteram suas metas locais.{" "}
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
