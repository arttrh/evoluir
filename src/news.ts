import { z } from "zod";
export const newsCategories = [
  "Todas",
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
  title: z.string().min(1).max(500),
  url: z
    .string()
    .url()
    .refine((u) => new URL(u).protocol === "https:"),
  source: z.string().min(1).max(100),
  category: z.enum(publicationCategories),
  publishedAt: z.string().datetime(),
});
export const newsResponseSchema = z.object({
  items: z.array(newsItemSchema).max(60),
  updatedAt: z.string().datetime(),
  unavailableSources: z.array(z.string()).max(20),
});
export type NewsItem = z.infer<typeof newsItemSchema>;
