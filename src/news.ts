import { z } from "zod";
export const newsCategories = [
  "Todas",
  "Java",
  "Spring",
  "Arquitetura",
] as const;
export const newsItemSchema = z.object({
  title: z.string().min(1).max(500),
  url: z
    .string()
    .url()
    .refine((u) => new URL(u).protocol === "https:"),
  source: z.string().min(1).max(100),
  category: z.enum(["Java", "Spring", "Arquitetura"]),
  publishedAt: z.string().datetime(),
});
export const newsResponseSchema = z.object({
  items: z.array(newsItemSchema).max(60),
  updatedAt: z.string().datetime(),
  unavailableSources: z.array(z.string()).max(4),
});
export type NewsItem = z.infer<typeof newsItemSchema>;
