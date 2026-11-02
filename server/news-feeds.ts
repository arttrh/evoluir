import { XMLParser, XMLValidator } from "fast-xml-parser";
import { newsItemSchema, type NewsItem } from "../src/news.js";
export const newsFeeds = [
  {
    name: "Inside Java",
    url: "https://inside.java/feed.xml",
    category: "Java",
  },
  {
    name: "Spring Blog",
    url: "https://spring.io/blog.atom",
    category: "Spring",
  },
  {
    name: "InfoQ Java",
    url: "https://feed.infoq.com/java/",
    category: "Java",
  },
  {
    name: "Martin Fowler",
    url: "https://martinfowler.com/feed.atom",
    category: "Arquitetura",
  },
] as const;
type Feed = (typeof newsFeeds)[number];
const list = (v: unknown): Record<string, unknown>[] =>
  v == null
    ? []
    : (Array.isArray(v) ? v : [v]).filter(
        (x): x is Record<string, unknown> =>
          typeof x === "object" && x !== null,
      );
const text = (v: unknown): string =>
  typeof v === "string"
    ? v
    : typeof v === "object" && v !== null
      ? text((v as Record<string, unknown>)["#text"])
      : "";
export function parseNewsFeed(xml: string, feed: Feed): NewsItem[] {
  if (
    xml.length > 1_000_000 ||
    /<!DOCTYPE|<!ENTITY/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("Feed inválido.");
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    ignoreDeclaration: true,
    maxNestedTags: 40,
    processEntities: true,
  });
  const document = parser.parse(xml);
  const entries = document.rss?.channel?.item || document.feed?.entry;
  const output: NewsItem[] = [];
  for (const entry of list(entries).slice(0, 40)) {
    let link = text(entry.link);
    if (!link) {
      const links = list(entry.link);
      link = String(
        (links.find((l) => l["@_rel"] === "alternate") ||
          links.find((l) => !l["@_rel"]))?.["@_href"] || "",
      );
    }
    let url: string;
    try {
      url = new URL(link, feed.url).href;
    } catch {
      continue;
    }
    const date = new Date(
      text(entry.pubDate) ||
        text(entry.published) ||
        text(entry.updated) ||
        text(entry["dc:date"]),
    );
    if (
      !Number.isFinite(date.getTime()) ||
      date.getTime() > Date.now() + 86400000
    )
      continue;
    const result = newsItemSchema.safeParse({
      title: text(entry.title)
        .replace(/<[^>]*>/g, "")
        .trim(),
      url,
      source: feed.name,
      category: feed.category,
      publishedAt: date.toISOString(),
    });
    if (result.success) output.push(result.data);
  }
  return output;
}
async function readBounded(response: Response) {
  if (Number(response.headers.get("content-length")) > 1_000_000)
    throw new Error("Feed muito grande.");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Feed vazio.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 1_000_000) throw new Error("Feed muito grande.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const part of chunks) {
    body.set(part, offset);
    offset += part.length;
  }
  return new TextDecoder().decode(body);
}
export async function fetchNews() {
  const result = await Promise.allSettled(
    newsFeeds.map(async (feed) => {
      const r = await fetch(feed.url, {
        redirect: "error",
        signal: AbortSignal.timeout(6500),
        headers: {
          Accept:
            "application/atom+xml, application/rss+xml, application/xml, text/xml",
        },
      });
      if (!r.ok) throw new Error("Fonte indisponível.");
      return parseNewsFeed(await readBounded(r), feed);
    }),
  );
  const items: NewsItem[] = [];
  const unavailableSources: string[] = [];
  result.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.length) items.push(...r.value);
    else unavailableSources.push(newsFeeds[i].name);
  });
  const urls = new Set<string>();
  return {
    items: items
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .filter((item) => {
        if (urls.has(item.url)) return false;
        urls.add(item.url);
        return true;
      })
      .slice(0, 60),
    updatedAt: new Date().toISOString(),
    unavailableSources,
  };
}
