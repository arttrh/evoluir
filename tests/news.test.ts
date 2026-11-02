import { afterEach, expect, it, vi } from "vitest";
import { parseNewsFeed, newsFeeds, fetchNews } from "../server/news-feeds";
const rss = (title = "Java novo", url = "https://inside.java/test") =>
  `<rss><channel><item><title>${title}</title><link>${url}</link><pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>`;
afterEach(() => vi.unstubAllGlobals());
it("lê metadados RSS e Atom sem reproduzir conteúdo integral", () => {
  expect(parseNewsFeed(rss(), newsFeeds[0])[0]).toMatchObject({
    title: "Java novo",
    url: "https://inside.java/test",
    source: "Inside Java",
  });
  const xml =
    '<feed><entry><title type="html">Design &amp; dados</title><link rel="self" href="https://example.com/id"/><link rel="alternate" href="https://example.com/article"/><updated>2026-11-01T12:00:00Z</updated><content>Conteúdo que não será reproduzido</content></entry></feed>';
  expect(parseNewsFeed(xml, newsFeeds[3])).toEqual([
    {
      title: "Design & dados",
      url: "https://example.com/article",
      source: "Martin Fowler",
      category: "Arquitetura",
      publishedAt: "2026-11-01T12:00:00.000Z",
    },
  ]);
});
it("recusa XML inválido, entidades, arquivos grandes e links inseguros", () => {
  for (const xml of [
    "<rss>",
    '<!DOCTYPE rss [<!ENTITY data SYSTEM "file:///etc/passwd">]><rss/>',
    "x".repeat(2_000_001),
  ])
    expect(() => parseNewsFeed(xml, newsFeeds[0])).toThrow();
  expect(
    parseNewsFeed(rss("Ataque", "javascript:alert(1)"), newsFeeds[0]),
  ).toEqual([]);
  expect(
    parseNewsFeed(
      rss().replace("Mon, 02 Nov 2026 10:00:00 GMT", "invalid"),
      newsFeeds[0],
    ),
  ).toEqual([]);
});
it("falha parcial mantém fontes disponíveis e elimina URLs repetidas", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.includes("spring")
        ? new Response("", { status: 503 })
        : new Response(rss()),
    ),
  );
  const result = await fetchNews();
  expect(result.items).toHaveLength(1);
  expect(result.unavailableSources).toEqual(["Spring Blog"]);
});
it("falha de todas as fontes é explícita", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const result = await fetchNews();
  expect(result.items).toEqual([]);
  expect(result.unavailableSources).toHaveLength(newsFeeds.length);
});

it("pesquisa assuntos no endpoint oficial sem aceitar URL arbitrária como destino", async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.startsWith("https://hn.algolia.com/"))
        return new Response(
          JSON.stringify({
            hits: [
              {
                title: "Golang: novidades da linguagem",
                url: "https://go.dev/blog/test",
                created_at: "2026-11-01T12:00:00Z",
                objectID: "1",
              },
              {
                title: "Ataque",
                url: "javascript:alert(1)",
                created_at: "2026-11-01T12:00:00Z",
                objectID: "2",
              },
            ],
          }),
        );
      return new Response(
        rss("Go recebe novidades", "https://go.dev/blog/test"),
      );
    }),
  );
  const result = await fetchNews("Golengue");
  expect(result.items.length).toBeGreaterThan(0);
  expect(result.items.every((i) => i.url.startsWith("https://"))).toBe(true);
  expect(calls.some((u) => u.includes("query=golang"))).toBe(true);
  expect(
    calls.every(
      (u) =>
        new URL(u).hostname === "hn.algolia.com" ||
        newsFeeds.some((f) => f.url === u),
    ),
  ).toBe(true);
});
it("assunto sem resultados retorna vazio sem inventar manchetes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ hits: [] }))),
  );
  const result = await fetchNews("assunto-inexistente-xyz");
  expect(result.items).toEqual([]);
  expect(result.unavailableSources).toEqual([]);
});
it("busca indisponível é identificada e não mistura manchetes de outro assunto", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const result = await fetchNews("Rust");
  expect(result.items).toEqual([]);
  expect(result.unavailableSources).toEqual(["Hacker News"]);
});

it("não confunde Rust com palavras que apenas contêm esse trecho", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            hits: [
              {
                title: "A trustworthy search engine",
                url: "https://example.com/trust",
                created_at: "2026-11-01T12:00:00Z",
                objectID: "1",
              },
              {
                title: "Rust on Linux",
                url: "https://example.com/rust",
                created_at: "2026-11-01T12:00:00Z",
                objectID: "2",
              },
            ],
          }),
        ),
    ),
  );
  expect((await fetchNews("rust")).items.map((i) => i.title)).toEqual([
    "Rust on Linux",
  ]);
});
it('a API recusa assunto repetido ou longo antes de consultar serviços externos',async()=>{
 const handler=(await import('../api/news')).default;const requestFetch=vi.fn();vi.stubGlobal('fetch',requestFetch);
 for(const q of [['Go','Rust'],'x'.repeat(121)]){let status=200;const res={status(code:number){status=code;return this;},json(){return this;},setHeader:vi.fn()};await handler({method:'GET',query:{q}} as any,res as any);expect(status).toBe(400);}
 expect(requestFetch).not.toHaveBeenCalled();
});
