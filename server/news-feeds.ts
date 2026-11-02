import { z } from "zod";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import {
  newsItemSchema,
  normalizeNewsQuery,
  newsSearchTerms,
  type NewsItem,
} from "../src/news.js";
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
  { name: "Go Blog", url: "https://go.dev/blog/feed.atom", category: "Go" },
  {
    name: "Python Insider",
    url: "https://blog.python.org/feeds/posts/default?alt=rss",
    category: "Python",
  },
  {
    name: "TypeScript Blog",
    url: "https://devblogs.microsoft.com/typescript/feed/",
    category: "JavaScript",
  },
  {
    name: "Kubernetes Blog",
    url: "https://kubernetes.io/feed.xml",
    category: "Cloud",
  },
  {
    name: "Cisco Talos",
    url: "https://blog.talosintelligence.com/rss/",
    category: "Segurança",
  },
  {
    name: "Microsoft Security",
    url: "https://www.microsoft.com/en-us/security/blog/feed/",
    category: "Segurança",
  },
] as const;
type Feed = { name: string; url: string; category: NewsItem["category"] };
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
    xml.length > 2_000_000 ||
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
export async function readBounded(response: Response) {
  if (Number(response.headers.get("content-length")) > 2_000_000)
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
      if (length > 2_000_000) throw new Error("Feed muito grande.");
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

const hnSchema = z.object({
  hits: z
    .array(
      z.object({
        title: z.string().nullable(),
        url: z.string().nullable(),
        created_at: z.string(),
        objectID: z.string(),
      }),
    )
    .max(50),
});
async function searchHeadlines(query: string): Promise<NewsItem[]> {
  const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
  url.search = new URLSearchParams({
    query: normalizeNewsQuery(query),
    tags: "story",
    hitsPerPage: "30",
    restrictSearchableAttributes: "title,url",
    numericFilters: "points>2",
  }).toString();
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error("Busca indisponível.");
  const result = hnSchema.parse(JSON.parse(await readBounded(response)));
  return result.hits.flatMap((hit) => {
    const parsed = newsItemSchema.safeParse({
      title: hit.title,
      url:
        hit.url ||
        `https://news.ycombinator.com/item?id=${encodeURIComponent(hit.objectID)}`,
      source: "Hacker News · comunidade",
      category: "Tecnologia",
      publishedAt: hit.created_at,
    });
    return parsed.success &&
      new Date(parsed.data.publishedAt).getTime() <= Date.now() + 86400000
      ? [parsed.data]
      : [];
  });
}
function matchesQuery(item: NewsItem, query: string) {
  const q = normalizeNewsQuery(query);
  if (!q) return true;
  const text = normalizeNewsQuery(
    `${item.title} ${item.source} ${item.category} ${newsSearchTerms[item.category] || ""} ${item.url}`,
  );
  if (q === "golang")
    return item.category === "Go" || /\bgo\b|golang/.test(text);
  if (q === "security" || q === "seguranca")
    return (
      item.category === "Segurança" ||
      /security|seguranca|vulnerab|cve-/.test(text)
    );
  return q.split(/\s+/).every((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(text);
  });
}
export async function fetchNews(query = "") {
  const normalized = normalizeNewsQuery(query);
  const feeds = normalized
    ? newsFeeds.filter((feed) =>
        matchesQuery(
          {
            title: "",
            url: feed.url,
            source: feed.name,
            category: feed.category,
            publishedAt: "",
          },
          normalized,
        ),
      )
    : newsFeeds;
  const jobs: { name: string; load: () => Promise<NewsItem[]> }[] = feeds.map(
    (feed) => ({
      name: feed.name,
      load: async () => {
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
      },
    }),
  );
  if (normalized)
    jobs.push({ name: "Hacker News", load: () => searchHeadlines(normalized) });
  const result = await Promise.allSettled(jobs.map((job) => job.load()));
  const items: NewsItem[] = [];
  const unavailableSources: string[] = [];
  result.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else unavailableSources.push(jobs[i].name);
  });
  const urls = new Set<string>();
  return {
    items: items
      .filter((i) => matchesQuery(i, normalized))
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
