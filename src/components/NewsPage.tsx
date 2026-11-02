import { useEffect, useState, useRef } from "react";
import {
  Newspaper,
  RefreshCw,
  ArrowUpRight,
  Search,
  WifiOff,
} from "lucide-react";
import { newsCategories, newsResponseSchema, type NewsItem } from "../news";
export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [updated, setUpdated] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  async function load() {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/news", { signal: abort.signal });
      if (!r.ok) throw new Error();
      const result = newsResponseSchema.parse(await r.json());
      if (!alive.current) return;
      setItems(result.items);
      setUpdated(result.updatedAt);
      setUnavailable(result.unavailableSources);
      setOffline(false);
      try {
        sessionStorage.setItem("evoluir.news.v1", JSON.stringify(result));
      } catch {
        /* O cache de notícias não impede a leitura. */
      }
    } catch {
      if (!alive.current || abort.signal.aborted) return;
      setError("Não foi possível atualizar as notícias.");
      setOffline(true);
    } finally {
      if (alive.current && !abort.signal.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    alive.current = true;
    try {
      const raw = sessionStorage.getItem("evoluir.news.v1");
      if (raw) {
        const cached = newsResponseSchema.parse(JSON.parse(raw));
        setItems(cached.items);
        setUpdated(cached.updatedAt);
        setUnavailable(cached.unavailableSources);
      }
    } catch {
      /* Um cache inválido é ignorado sem tocar nos registros pessoais. */
    }
    void load();
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  const filtered = items.filter(
    (i) =>
      (category === "Todas" || i.category === category) &&
      `${i.title} ${i.source}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="news-page">
      <div className="news-intro">
        <div>
          <h2>No seu radar.</h2>
          <p>
            Java, backend e arquitetura, direto das fontes.
          </p>
        </div>
        <button
          className="icon-button"
          aria-label="Atualizar notícias"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw size={20} className={busy ? "spin" : ""} />
        </button>
      </div>
      <div className="news-toolbar">
        <div className="news-categories" aria-label="Categorias de notícias">
          {newsCategories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="news-search">
          <Search size={16} />
          <span className="sr-only">Filtrar notícias</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={120}
            placeholder="Buscar nas manchetes"
          />
        </label>
      </div>
      {updated && (
        <p className="news-updated">
          {offline ? (
            <>
              <WifiOff size={13} />
              Última leitura salva
            </>
          ) : (
            "Atualizadas"
          )}{" "}
          ·{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(updated))}
        </p>
      )}
      {error && (
        <p className="planning-note" role="status">
          {error}
          {items.length
            ? " Mostrando a última leitura salva nesta sessão."
            : " Tente novamente quando tiver conexão."}
        </p>
      )}
      {unavailable.length > 0 && !offline && (
        <p className="muted small">
          Fontes indisponíveis: {unavailable.join(", ")}.
        </p>
      )}
      {busy && !items.length ? (
        <div className="news-loading" role="status" aria-busy="true">
          <Newspaper size={26} />
          <p>Buscando as últimas publicações…</p>
        </div>
      ) : filtered.length ? (
        <div className="news-grid">
          {filtered.map((item, i) => (
            <article
              className={`news-card ${i === 0 ? "news-featured" : ""}`}
              key={item.url}
            >
              <div className="news-card-meta">
                <span>{item.category}</span>
                <time dateTime={item.publishedAt}>
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(item.publishedAt))}
                </time>
              </div>
              <h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <div className="news-card-footer">
                <span>{item.source}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ler ${item.title} na fonte original`}
                >
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Newspaper size={26} />
          <h3>
            {items.length
              ? "Nenhuma manchete neste filtro"
              : "Nenhuma notícia disponível agora"}
          </h3>
          <p>
            {items.length
              ? "Tente outra palavra ou categoria."
              : "As publicações aparecem aqui quando as fontes responderem. Não há notícias fictícias."}
          </p>
        </div>
      )}
      <p className="news-disclosure">
        Fontes: Inside Java, Spring Blog, InfoQ e Martin Fowler. Os artigos
        abrem na publicação original; nenhum texto integral é reproduzido. Há
        publicações em inglês.
      </p>
    </section>
  );
}
