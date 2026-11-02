import { useState } from "react";
import {
  Search,
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
import { createTrack, expandTrack } from "../catalog";
import { uid, type Data, type Track } from "../model";
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
  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSources([]);
    setSearched("");
    try {
      const response = await fetch(
        `/api/study-search?q=${encodeURIComponent(query.trim())}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw new Error();
      const result = z
        .object({ sources: z.array(studySourceSchema), warning: z.string() })
        .parse(await response.json());
      setSources(result.sources);
      setError(result.warning);
      setSearched(query.trim());
    } catch {
      setSources(officialSources(query));
      setSearched(query.trim());
      setError(
        "Sem resposta da busca online. Mostrando apenas o catálogo oficial disponível no aplicativo.",
      );
    } finally {
      setBusy(false);
    }
  }
  function build() {
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
          <span className="eyebrow">Um caminho com contexto</span>
          <h2>O que você quer dominar?</h2>
        </div>
        <span className="explorer-icon">
          <BookOpen size={24} />
        </span>
      </div>
      <p className="muted small">
        Busque um assunto e escolha o foco. Documentação primeiro, prática
        depois, revisão para consolidar.
      </p>
      <form className="study-search" onSubmit={search}>
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
          placeholder="Spring Cloud, Docker, Java…"
        />
        <button className="button" disabled={busy} type="submit">
          {busy ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Search size={17} />
          )}
          <span>{busy ? "Buscando" : "Buscar fontes"}</span>
        </button>
      </form>
      {error && (
        <p className="planning-note" role="status">
          {error}
        </p>
      )}
      {searched && (
        <div className="search-results">
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
          <label className="field">
            <span>Quais tópicos você quer priorizar? (opcional)</span>
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              maxLength={1200}
              placeholder="Ex.: Eureka, Gateway, Circuit Breaker"
            />
            <small>
              Até 12 tópicos, separados por vírgula. As referências oficiais do
              assunto acompanham os módulos para você revisar e ajustar.
            </small>
          </label>
          <button className="button" onClick={build}>
            <Plus size={17} />
            Criar trilha deste assunto
          </button>
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
      {track &&
        track.modules.flatMap((m) => m.topics).length < 10 &&
        /spring.*cloud/i.test(track.title) && (
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
            Ampliar trilha com fundamentos, segurança, mensageria e projeto
          </button>
        )}
    </section>
  );
}
