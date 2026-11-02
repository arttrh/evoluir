import { useEffect, useState, useRef } from "react";
import {
  Newspaper,
  RefreshCw,
  ArrowUpRight,
  Search,
  WifiOff,
} from "lucide-react";
import {
  newsCategories,
  newsResponseSchema,
  newsSearchTerms,
  type NewsItem,
} from "../news";
export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [updated, setUpdated] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");
  const [offline, setOffline] = useState(false);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const term =
    query.trim() ||
    (category === "Todas" ? "" : newsSearchTerms[category] || category);
  async function load(subject = term) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    setOffline(false);
    if (subject !== searched) {
      setItems([]);
      setUpdated("");
      setUnavailable([]);
    }
    setSearched(subject);
    try {
      const r = await fetch(
        `/api/news${subject ? `?q=${encodeURIComponent(subject)}` : ""}`,
        { signal: abort.signal },
      );
      if (!r.ok) throw new Error();
      const result = newsResponseSchema.parse(await r.json());
      if (!alive.current || abort.signal.aborted) return;
      setItems(result.items);
      setUpdated(result.updatedAt);
      setUnavailable(result.unavailableSources);
      setSearched(subject);
      try {
        sessionStorage.setItem(
          "evoluir.news.v2",
          JSON.stringify({ ...result, query: subject }),
        );
      } catch {
        /* O cache não impede a leitura. */
      }
    } catch {
      if (!alive.current || abort.signal.aborted) return;
      setError("Não foi possível atualizar as notícias.");
      setOffline(true);
      try {
        const raw = sessionStorage.getItem("evoluir.news.v2");
        const cached = raw ? JSON.parse(raw) : null;
        if (cached?.query === subject) {
          const result = newsResponseSchema.parse(cached);
          setItems(result.items);
          setUpdated(result.updatedAt);
          setUnavailable(result.unavailableSources);
          setSearched(subject);
        }
      } catch {
        /* Cache inválido é ignorado. */
      }
    } finally {
      if (alive.current && !abort.signal.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    controller.current?.abort();
    setBusy(true);
    const timer = setTimeout(() => void load(term), term ? 550 : 0);
    return () => {
      clearTimeout(timer);
      controller.current?.abort();
    };
    // A busca é repetida somente quando o assunto muda.
  }, [term]);
  return (
    <section className="news-page">
      <div className="news-intro">
        <div>
          <h2>No seu radar.</h2>
          <p>Tecnologia, desenvolvimento e segurança, de várias fontes.</p>
        </div>
        <button
          className="icon-button"
          aria-label="Atualizar notícias"
          disabled={busy}
          onClick={() => void load(term)}
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
              onClick={() => {
                setCategory(c);
                setQuery("");
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="news-search">
          <Search size={16} />
          <span className="sr-only">Buscar notícias</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCategory("Todas");
            }}
            maxLength={120}
            placeholder="Go, Rust, segurança, IA…"
          />
        </label>
      </div>
      {searched && (
        <p className="news-query">
          Resultados para <strong>{searched}</strong>
        </p>
      )}
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
      {busy ? (
        <div className="news-loading" role="status" aria-busy="true">
          <Newspaper size={26} />
          <p>Buscando as últimas publicações…</p>
        </div>
      ) : items.length ? (
        <div className="news-grid">
          {items.map((item, i) => (
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
            {term
              ? "Nenhuma notícia para este assunto"
              : "Nenhuma notícia disponível agora"}
          </h3>
          <p>
            {term
              ? "Tente outra palavra ou categoria."
              : "As publicações aparecem aqui quando as fontes responderem. Não há notícias fictícias."}
          </p>
        </div>
      )}
      <p className="news-disclosure">
        Publicações dos projetos e fontes técnicas. A busca por assunto inclui
        manchetes compartilhadas no Hacker News, identificadas como comunidade.
        Datas são de publicação; os artigos abrem na fonte original. Há
        conteúdos em inglês.
      </p>
    </section>
  );
}
