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
    "x".repeat(1_000_001),
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
  expect(result.unavailableSources).toHaveLength(4);
});
