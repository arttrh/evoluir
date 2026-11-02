import { AnimatedIcon } from "./AnimatedIcon";
import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Plus,
  LoaderCircle,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  officialSources,
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
    setQuery(value);
    setTopics("");
    setBusy(true);
    setError("");
    setSources([]);
    setSearched("");
    try {
      const response = await fetch(
        `/api/study-search?q=${encodeURIComponent(value.trim())}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw new Error();
      const result = z
        .object({ sources: z.array(studySourceSchema), warning: z.string() })
        .parse(await response.json());
      setSources(result.sources);
      setError(result.warning);
      setSearched(value.trim());
    } catch {
      setSources(officialSources(value));
      setSearched(value.trim());
      setError(
        "Sem resposta da busca online. Mostrando apenas o catálogo oficial disponível no aplicativo.",
      );
    } finally {
      setBusy(false);
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
        Escolha um assunto. Receba uma trilha pronta, do básico ao avançado, com
        prática e fontes em cada etapa.
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
              <button className="button" onClick={build}>
                <Plus size={17} />
                Criar trilha deste assunto
              </button>
              <ol>
                {preview.modules.map((m) => (
                  <li key={m.id}>
                    {m.title}
                    <small>{m.topics.length} tópicos</small>
                  </li>
                ))}
              </ol>
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
            <span>{sources.length} referências</span>
          </div>
          {sources.length ? (
            sources.map((r, i) => (
              <a
                key={`${r.url}-${i}`}
                className="source-result"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="source-kind">
                  {r.kind === "official"
                    ? "Documentação oficial"
                    : "Comunidade · Stack Overflow"}
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
              Nenhuma fonte encontrada. Tente o nome da tecnologia em inglês ou
              acrescente um tópico específico. Você pode cadastrar suas próprias
              referências na trilha.
            </p>
          )}
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
