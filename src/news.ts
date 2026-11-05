import { z } from "zod";
export const newsCategories = [
  "Todas",
  "JetBrains",
  "Go",
  "Python",
  "JavaScript",
  "Segurança",
  "Cloud",
  "Java",
  "Spring",
  "Arquitetura",
] as const;
export const publicationCategories = [
  "Go",
  "Python",
  "JavaScript",
  "Segurança",
  "Cloud",
  "Java",
  "Spring",
  "Arquitetura",
  "Tecnologia",
] as const;
export function normalizeNewsQuery(query: string) {
  const q = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return /^(go|golang|go lang|golengue|golink)$/.test(q)
    ? "golang"
    : /^(seguranca|ciberseguranca)$/.test(q)
      ? "security"
      : /^(ia|inteligencia artificial)$/.test(q)
        ? "ai"
        : q;
}
export const newsSearchTerms: Record<string, string> = {
  Go: "golang",
  Python: "python",
  JavaScript: "javascript",
  Segurança: "security",
  Cloud: "cloud",
  Java: "java",
  Spring: "spring",
  Arquitetura: "architecture",
};
export const newsItemSchema = z.object({
  title: z.string().trim().min(1).max(500),
  url: z
    .string()
    .url()
    .max(2000)
    .refine((u) => {
      const parsed = new URL(u);
      return (
        parsed.protocol === "https:" && !parsed.username && !parsed.password
      );
    }),
  source: z.string().min(1).max(100),
  category: z.enum(publicationCategories),
  publishedAt: z.string().datetime(),
  dateKind: z.enum(["published", "shared"]).optional(),
});
export const newsResponseSchema = z.object({
  items: z.array(newsItemSchema).max(80),
  updatedAt: z.string().datetime(),
  page: z.number().int().min(0).max(9).optional(),
  hasMore: z.boolean().optional(),
  unavailableSources: z.array(z.string()).max(20),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export function newsKey(value: string) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()])
    if (/^utm_|^(fbclid|gclid|mc_cid|mc_eid)$/i.test(key))
      url.searchParams.delete(key);
  url.searchParams.sort();
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, "");
  return url.href;
}

export function readNewsHistory(raw: string | null): string[] {
  try {
    return z
      .array(z.string().max(2000))
      .max(2000)
      .parse(JSON.parse(raw || "[]"));
  } catch {
    return [];
  }
}
export function mergeNews(previous: NewsItem[], next: NewsItem[]) {
  const seen = new Set<string>();
  return [...previous, ...next].filter((item) => {
    const key = newsKey(item.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
