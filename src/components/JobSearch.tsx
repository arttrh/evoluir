import { AnimatedIcon } from "./AnimatedIcon";
import { useEffect, useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { jobSources, vacanciesSchema, type JobSearch as SearchFilters, type Vacancy } from "../jobs";
import { formatDate, type Job } from "../model";

export function JobSearch({ jobs, onSave }: { jobs: Job[]; onSave: (vacancy: Vacancy) => void }) {
  const id = useId();
  const [q, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<SearchFilters["source"]>("Todas");
  const [filters, setFilters] = useState<SearchFilters>({ q: "", location: "", source: "Todas" });
  const [refresh, setRefresh] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof vacanciesSchema.parse> | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    setBusy(true);
    setError("");
    async function load() {
      try {
        const response = await fetch(`/api/jobs?${new URLSearchParams(filters)}`, { signal: abort.signal });
        if (!response.ok) throw new Error();
        const next = vacanciesSchema.parse(await response.json());
        if (active) setResult(next);
      } catch {
        if (active) setError("Não foi possível buscar vagas. Confira sua conexão ou tente novamente em alguns minutos; a fonte limita consultas.");
      } finally {
        if (active) setBusy(false);
      }
    }
    void load();
    return () => { active = false; abort.abort(); };
  }, [filters, refresh]);

  useEffect(() => {
    if (!automatic) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) setRefresh((n) => n + 1);
    }, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [automatic]);

  return (
    <section className="glass job-search" aria-labelledby={`${id}-heading`}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Busca de oportunidades</span>
          <h2 id={`${id}-heading`}>Encontre seu próximo passo.</h2>
        </div>
        <AnimatedIcon name="Busca" size={24} />
      </div>
      <p>Vagas de desenvolvimento publicadas nos últimos 90 dias, abertas nas comunidades Backend BR e Frontend BR.</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        setResult(null);
        setFilters({ q: q.trim(), location: location.trim(), source });
      }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor={`${id}-query`}>Cargo, tecnologia ou nível</label>
            <input id={`${id}-query`} value={q} onChange={(e) => setQuery(e.target.value)} maxLength={100} placeholder="Java, estágio, júnior…" />
          </div>
          <div className="field">
            <label htmlFor={`${id}-location`}>Localização ou modalidade</label>
            <input id={`${id}-location`} value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="Remoto, São Paulo…" />
          </div>
          <div className="field">
            <label htmlFor={`${id}-source`}>Fonte das vagas</label>
            <select id={`${id}-source`} value={source} onChange={(e) => setSource(e.target.value as SearchFilters["source"])}>
              {jobSources.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
          <button className="button" type="submit" disabled={busy}><AnimatedIcon name="Busca" size={18} />Buscar vagas</button>
        </div>
      </form>
      <label className="job-refresh">
        <input type="checkbox" checked={automatic} onChange={(e) => setAutomatic(e.target.checked)} />
        Atualizar esta busca a cada 15 minutos com a tela aberta
      </label>
      <p className="small muted">Os termos são combinados: cada palavra precisa aparecer no anúncio. A fonte não garante que a vaga ainda esteja disponível. Confira os detalhes antes de enviar seus dados.</p>
      <p role="status" aria-live="polite" className="small muted">
        {busy ? "Buscando vagas…" : error ? `${error}${result ? " Mostrando a última consulta recebida." : ""}` : (result ? `${result.items.length} vagas exibidas de ${result.total} resultados. Consulta em ${new Date(result.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.${result.incomplete ? " A fonte retornou resultados parciais." : ""}` : "")}
      </p>
      {!busy && !error && result && !result.items.length && <p>Nenhuma vaga encontrada. Tente menos termos ou outra localização.</p>}
      {result && !busy && <div className="jobs">
        {result.items.map((item) => {
          const saved = jobs.some((job) => job.url === item.url);
          return <article className="job-search-result" key={item.url}>
            <p className="small muted">{item.source} · Publicada em {formatDate(item.publishedAt.slice(0, 10))}</p>
            <h3>{item.title}</h3>
            {item.labels.length > 0 && <p className="small muted">{item.labels.join(" · ")}</p>}
            <details>
              <summary>Descrição e instruções de candidatura</summary>
              <p className="notes" tabIndex={0} role="region" aria-label="Texto do anúncio">{item.description || "Consulte as instruções no anúncio original."}</p>
            </details>
            <div className="job-actions">
              <button className="button secondary" type="button" disabled={saved} onClick={() => onSave(item)}>
                {saved ? "Já salva no painel" : "Salvar oportunidade"}
              </button>
              <a className="text-button" href={item.url} target="_blank" rel="noopener noreferrer">Ver anúncio<ArrowUpRight size={15} /></a>
            </div>
          </article>;
        })}
      </div>}
      <p className="small muted">Salve a oportunidade, envie seu currículo pelo canal indicado no anúncio e confirme o envio no painel. Abrir o anúncio não registra uma candidatura.</p>
      <a className="text-button" href="https://www.linkedin.com/in/arthurlucaas/" target="_blank" rel="noopener noreferrer">Meu LinkedIn<ArrowUpRight size={15} /></a>
    </section>
  );
}
