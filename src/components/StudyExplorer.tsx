import { fetchCloud } from "../cloud";
import { AnimatedIcon } from "./AnimatedIcon";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Plus,
  LoaderCircle,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  officialSources,
  studyProviders,
  sourcePublisher,
  studySearchLinks,
  roadmapFor,
  studySourceSchema,
  topicModule,
  type StudySource,
} from "../study-sources";
import {
  createTrack,
  expandTrack,
  hasExpansion,
  templateFor,
  templateNames,
} from "../catalog";
import { type Data, type Track } from "../model";
import { z } from "zod";
export function StudyExplorer({
  track,
  onChange,
  onCreated,
}: {
  track?: Track;
  onCreated: (id: string) => void;
  onChange: (f: (d: Data) => Data, message?: string) => boolean;
}) {
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState("");
  const [sources, setSources] = useState<StudySource[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");
  const [checkedAt, setCheckedAt] = useState("");
  const [kind, setKind] = useState("all");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const visibleSources = sources.filter(source => kind === "all" || source.kind === kind);
  const sourceLabels = { official: "Documentação oficial", article: "Artigo / tutorial", community: "Discussão", roadmap: "Roteiro" };

  const preview = useMemo(
    () =>
      searched && templateFor(searched) !== "manual"
        ? createTrack(searched, "auto")
        : null,
    [searched],
  );
  const expansion = useMemo(
    () =>
      track && hasExpansion(track) ? createTrack(track.title, "auto") : null,
    [track],
  );
  async function searchFor(value: string) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setKind("all");
    setCheckedAt("");
    setQuery(value);
    setTopics("");
    setBusy(true);
    setError("");
    setSources([]);
    setSearched("");
    try {
      const schema = z.object({ sources: z.array(studySourceSchema).max(80), warning: z.string(), searchedAt: z.iso.datetime().optional(), unavailableSources: z.array(z.string()).optional() });
      async function read() {
        const response = await fetchCloud(`/api/study-search?q=${encodeURIComponent(value.trim())}`, abort.signal);
        if (!response.ok) throw new Error();
        return schema.parse(await response.json());
      }
      let result = await read();
      // A new Free instance can fail every upstream request while starting; retry once.
      if (studyProviders.every(provider => result.unavailableSources?.includes(provider.name))) result = await read();
      if (abort.signal.aborted) return;
      setCheckedAt(result.searchedAt || "");
      setSources(result.sources);
      setError(result.warning);
      setSearched(value.trim());
    } catch {
      if (abort.signal.aborted) return;
      setSources(officialSources(value));
      setSearched(value.trim());
      setError(
        "Sem resposta da busca online. Mostrando apenas o catálogo oficial disponível no aplicativo.",
      );
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  function build() {
    if (!preview) return;
    const title = searched;
    const base = createTrack(title, "auto");
    const requested = topics
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
    const next = {
      ...base,
      modules: requested.length
        ? requested.map((t) =>
            topicModule(
              t,
              sources.filter(
                (s) =>
                  s.kind === "official" ||
                  s.title.toLowerCase().includes(t.toLowerCase()),
              ),
              base,
            ),
          )
        : base.modules,
    };
    if (!requested.length && next.modules[0].title === "Primeiro módulo")
      next.modules = [topicModule(title, sources)];
    if (
      onChange(
        (d) => ({ ...d, tracks: [...d.tracks, next] }),
        "Trilha criada com as referências encontradas.",
      )
    )
      onCreated(next.id);
  }
  const roadmap = roadmapFor(searched || track?.title || "");
  return (
    <section className="study-explorer glass">
      <div className="section-heading">
        <div>
          <h2>O que você quer dominar?</h2>
        </div>
        <span className="explorer-icon">
          <BookOpen size={24} />
        </span>
      </div>
      <p className="muted small">
        Pesquise uma tecnologia ou dúvida específica. Consulte documentação,
        artigos e discussões; use as trilhas disponíveis para organizar sua prática.
      </p>
      {track && expansion && (
        <div className="study-upgrade">
          <h3>
            Formação disponível: {expansion.modules.length} módulos ·{" "}
            {expansion.modules.reduce((n, m) => n + m.topics.length, 0)} aulas
          </h3>
          <p>
            A atualização reorganiza o conteúdo e preserva suas conclusões,
            revisões e tópicos próprios.
          </p>
          <button
            className="text-button"
            onClick={() =>
              onChange(
                (d) => ({
                  ...d,
                  tracks: d.tracks.map((t) =>
                    t.id === track.id ? expandTrack(t) : t,
                  ),
                }),
                "Trilha ampliada. Seu progresso anterior foi preservado.",
              )
            }
          >
            <Plus size={16} />
            Atualizar formação e preservar progresso
          </button>
        </div>
      )}
      <form
        className="study-search"
        onSubmit={(e) => {
          e.preventDefault();
          void searchFor(query);
        }}
      >
        <label className="sr-only" htmlFor="study-query">
          Assunto para pesquisar
        </label>
        <input
          id="study-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          minLength={2}
          maxLength={120}
          placeholder="Go, Python, React, segurança…"
          list="study-subjects"
        />
        <button className="button" disabled={busy} type="submit">
          {busy ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <AnimatedIcon name="Busca" size={18} />
          )}
          <span>{busy ? "Buscando" : "Buscar fontes"}</span>
        </button>
      </form>
      {busy && <p role="status" className="muted small">Consultando documentação, artigos e comunidades… O servidor gratuito pode levar um minuto para iniciar.</p>}
      <datalist id="study-subjects">
        {templateNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className="study-suggestions" aria-label="Sugestões de estudo">
        {["Go", "Python", "JavaScript", "Segurança", "System Design"].map(
          (subject) => (
            <button
              key={subject}
              className="chip"
              disabled={busy}
              onClick={() => void searchFor(subject)}
            >
              {subject}
            </button>
          ),
        )}
      </div>
      {error && (
        <p className="planning-note" role="status">
          {error}
          {searched && <span className="study-failed-source-links">{studySearchLinks(searched).filter(link=>error.includes(link.title)).map(link=><a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer">Pesquisar em {link.title}<ArrowUpRight size={14}/></a>)}</span>}
        </p>
      )}
      {searched && (
        <div className="search-results">
          {preview ? (
            <div className="track-outline">
              <div>
                <span className="eyebrow">Trilha pronta</span>
                <h3>
                  {preview.modules.length} módulos ·{" "}
                  {preview.modules.reduce((n, m) => n + m.topics.length, 0)}{" "}
                  tópicos
                </h3>
              </div>
              <button className="button" onClick={build}>
                <Plus size={17} />
                Criar trilha deste assunto
              </button>
              <details className="study-preview-modules">
                <summary>Ver módulos e objetivo da trilha</summary>
              <p>{preview.objective}</p>
              {["Java", "Spring Boot", "Spring Cloud"].includes(
                templateFor(searched),
              ) && (
                <a
                  className="course-reference"
                  href="https://www.youtube.com/watch?v=q6z_UCBM5Ek"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vídeo de apoio · Telusko · cerca de 63 horas
                  <small>
                    Os links de cada aula abrem no capítulo de apoio. O roteiro,
                    o laboratório e os critérios desta formação são próprios.
                  </small>
                </a>
              )}
              <ol>
                {preview.modules.map((m) => (
                  <li key={m.id}>
                    {m.title}
                    <small>{m.topics.length} tópicos</small>
                  </li>
                ))}
              </ol>
              </details>
            </div>
          ) : (
            <p className="planning-note" role="status">
              Este assunto ainda não tem uma trilha pronta revisada. As fontes
              abaixo ajudam na pesquisa. Experimente um dos{" "}
              {templateNames.length} assuntos do catálogo.
            </p>
          )}
          <div className="section-heading">
            <h3>Fontes para {searched}</h3>
            <span>{visibleSources.length} de {sources.length} referências</span>
          </div>
          {checkedAt && <p className="muted small">Última consulta: <time dateTime={checkedAt}>{new Date(checkedAt).toLocaleString("pt-BR")}</time></p>}
          <div className="study-source-filters" role="group" aria-label="Tipos de fonte">
            {[["all","Todas"],["official","Documentação"],["article","Artigos e tutoriais"],["community","Discussões"]].map(([value,label])=><button key={value} type="button" aria-pressed={kind===value} onClick={()=>setKind(value!)}>{label}</button>)}
          </div>
          {visibleSources.length ? (
            visibleSources.map((r, i) => (
              <a
                key={`${r.url}-${i}`}
                className="source-result"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="source-kind">
                  {sourceLabels[r.kind]} · {sourcePublisher(r)}
                </span>
                <strong>
                  {r.title}
                  <ArrowUpRight size={14} />
                </strong>
                <span>{r.why}</span>
              </a>
            ))
          ) : (
            <p className="muted small">
              Nenhum resultado neste tipo de fonte. Experimente outro filtro,
              um termo mais específico ou as buscas diretas abaixo.
            </p>
          )}
          <details className="study-direct-search help" open={sources.length === 0}>
            <summary>Pesquisar também nas fontes</summary>
            <p className="muted small">Estas buscas abrem no site original com o assunto preenchido. São atalhos para aprofundar, não artigos encontrados. Alguns sites podem exigir login ou assinatura.</p>
            <div className="study-search-links">{studySearchLinks(searched).map(link=><a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer">{link.title}<ArrowUpRight size={16}/></a>)}</div>
          </details>
          {preview && (
            <details className="help">
              <summary>Personalizar foco (opcional)</summary>
              <label className="field">
                <span>Quais tópicos você quer priorizar? (opcional)</span>
                <textarea
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  maxLength={1200}
                  placeholder="Ex.: Eureka, Gateway, Circuit Breaker"
                />
                <small>
                  Até 12 tópicos, separados por vírgula. As referências oficiais
                  do assunto acompanham os módulos para você revisar e ajustar.
                </small>
              </label>
            </details>
          )}
        </div>
      )}
      {roadmap && (
        <a
          className="roadmap-reference"
          href={roadmap.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Layers size={18} />
          <span>
            <strong>{roadmap.title}</strong>
            <small>Consultar no roadmap.sh · referência externa</small>
          </span>
          <ArrowUpRight size={17} />
        </a>
      )}
    </section>
  );
}
