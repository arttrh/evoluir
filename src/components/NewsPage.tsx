import { fetchCloud } from "../cloud";
import { AnimatedIcon } from "./AnimatedIcon";
import { useEffect, useState, useRef } from "react";
import {
  Newspaper,
  RefreshCw,
  ArrowUpRight,
  WifiOff,
  Check,
} from "lucide-react";
import {
  newsCategories,
  newsResponseSchema,
  newsSearchTerms,
  newsKey,
  readNewsHistory,
  mergeNews,
  type NewsItem,
} from "../news";
export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [updated, setUpdated] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [notice, setNotice] = useState("");
  const [read, setRead] = useState<string[]>(() => {
    try {
      return readNewsHistory(localStorage.getItem("prumo.news.read.v1"));
    } catch {
      return [];
    }
  });
  const [showRead, setShowRead] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");
  const [offline, setOffline] = useState(false);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const term =
    query.trim() ||
    (category === "Todas" ? "" : newsSearchTerms[category] || category);
  async function load(subject = term, nextPage = 0, fresh = false) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    setNotice("");
    setOffline(false);
    if (subject !== searched) {
      setItems([]);
      setUpdated("");
      setUnavailable([]);
    }
    setSearched(subject);
    try {
      const params = new URLSearchParams();
      if (subject) params.set("q", subject);
      if (nextPage) params.set("page", String(nextPage));
      if (fresh) params.set("fresh", "1");
      const r = await fetchCloud(`/api/news${params.size ? `?${params}` : ""}`, abort.signal);
      if (!r.ok) throw new Error();
      const result = newsResponseSchema.parse(await r.json());
      if (!alive.current || abort.signal.aborted) return;
      if (
        fresh &&
        nextPage === 0 &&
        items.length &&
        !result.items.some(
          (i) => !items.some((old) => newsKey(old.url) === newsKey(i.url)),
        )
      )
        setNotice(
          "As fontes ainda não publicaram manchetes diferentes neste lote. Você pode carregar mais publicações ou buscar outro assunto.",
        );
      setItems((old) =>
        nextPage ? mergeNews(old, result.items) : result.items,
      );
      setPage(nextPage);
      setHasMore(result.hasMore ?? false);
      setUpdated(result.updatedAt);
      setUnavailable(result.unavailableSources);
      setSearched(subject);
      try {
        if (nextPage === 0)
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
        if (nextPage) return;
        const raw = sessionStorage.getItem("evoluir.news.v2");
        const cached = raw ? JSON.parse(raw) : null;
        if (cached?.query === subject) {
          const result = newsResponseSchema.parse(cached);
          setItems(result.items);
          setPage(result.page ?? 0);
          setHasMore(result.hasMore ?? false);
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
    if (term !== searched) {
      setItems([]);
      setUpdated("");
      setHasMore(false);
    }
    const timer = setTimeout(() => void load(term), term ? 550 : 0);
    return () => {
      clearTimeout(timer);
      controller.current?.abort();
    };
    // A busca é repetida somente quando o assunto muda.
  }, [term]);
  const readSet = new Set(read);
  const visible = items.filter(
    (item) => showRead || !readSet.has(newsKey(item.url)),
  );
  function markRead(item: NewsItem) {
    const key = newsKey(item.url);
    const next = [...read.filter((v) => v !== key), key].slice(-2000);
    setRead(next);
    try {
      localStorage.setItem("prumo.news.read.v1", JSON.stringify(next));
    } catch {
      setNotice(
        "O navegador não salvou o histórico de leitura. As notícias continuam disponíveis.",
      );
    }
  }
  return (
    <section className="news-page">
      <div className="news-intro">
        <div>
          <h2>Java e tecnologia.</h2>
          <p>Publicações na fonte original. Seu histórico de leitura fica neste aparelho.</p>
        </div>
        <button
          className="icon-button"
          aria-label="Atualizar notícias"
          disabled={busy}
          onClick={() => void load(term, 0, true)}
        >
          <RefreshCw size={20} className={busy ? "spin" : ""} />
        </button>
      </div>
      <aside className="news-source-note">
        <a href="https://www.jetbrains.com/lp/jam/" target="_blank" rel="noopener noreferrer">JetBrains · Java Annotated Monthly <ArrowUpRight size={16} /></a>
      </aside>
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
          <AnimatedIcon name="Busca" size={18} />
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
      <div className="news-reading">
        <span aria-live="polite">
          {visible.length} {showRead ? "carregadas" : "não vistas"}
        </span>
        <label>
          <input
            type="checkbox"
            checked={showRead}
            onChange={(e) => setShowRead(e.target.checked)}
          />
          Mostrar vistas
        </label>
        {visible.length > 0 && !showRead && (
          <button
            className="text-button"
            onClick={() => {
              const next = [
                ...new Set([...read, ...visible.map((i) => newsKey(i.url))]),
              ].slice(-2000);
              setRead(next);
              try {
                localStorage.setItem(
                  "prumo.news.read.v1",
                  JSON.stringify(next),
                );
              } catch {
                setNotice("O navegador não salvou o histórico de leitura.");
              }
            }}
          >
            Marcar lote como visto
          </button>
        )}
      </div>

      {notice && (
        <p className="planning-note" role="status">
          {notice}
        </p>
      )}
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
      {busy && !items.length ? (
        <div className="news-loading" role="status" aria-busy="true">
          <Newspaper size={26} />
          <p>Buscando as últimas publicações… O servidor gratuito pode levar um minuto para iniciar.</p>
        </div>
      ) : visible.length ? (
        <div className="news-grid">
          {visible.map((item, i) => (
            <article
              className={`news-card ${i === 0 ? "news-featured" : ""}`}
              key={item.url}
            >
              <div className="news-card-meta">
                <span>{item.category}</span>
                <time dateTime={item.publishedAt}>
                  {item.dateKind === "shared" ? "Compartilhada · " : ""}
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(item.publishedAt))}
                </time>
              </div>
              <h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markRead(item)}
                >
                  {item.title}
                </a>
              </h3>
              <div className="news-card-footer">
                <span>{item.source}</span>
                <button
                  className="icon-button"
                  aria-label={`Marcar como vista: ${item.title}`}
                  disabled={readSet.has(newsKey(item.url))}
                  onClick={() => markRead(item)}
                >
                  <Check size={16} />
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ler ${item.title} na fonte original`}
                  onClick={() => markRead(item)}
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
            {items.length && !showRead
              ? "Você já viu estas manchetes"
              : term
                ? "Nenhuma notícia para este assunto"
                : "Nenhuma notícia disponível agora"}
          </h3>
          <p>
            {items.length && !showRead
              ? "Carregue mais publicações ou ative Mostrar vistas para consultar este lote novamente."
              : term
                ? "Tente outra palavra ou categoria."
                : "As publicações aparecem aqui quando as fontes responderem."}
          </p>
        </div>
      )}
      {hasMore && (
        <button
          className="button news-more"
          disabled={busy}
          onClick={() => void load(term, page + 1)}
        >
          {busy ? "Buscando mais publicações…" : "Carregar mais publicações"}
        </button>
      )}
      <p className="news-disclosure">
        Publicações dos projetos e fontes técnicas. A busca por assunto inclui
        manchetes compartilhadas no Hacker News, identificadas como comunidade.
        Nas fontes editoriais, a data é de publicação; na comunidade, é de
        compartilhamento. Os artigos abrem na fonte original. Há conteúdos em
        inglês.
      </p>
    </section>
  );
}
