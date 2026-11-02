import { z } from "zod";

export const jobSources = ["Todas", "Backend BR", "Frontend BR"] as const;
export const jobSearchSchema = z.object({
  q: z.string().trim().max(100).default(""),
  location: z.string().trim().max(60).default(""),
  source: z.enum(jobSources).default("Todas"),
});
export type JobSearch = z.infer<typeof jobSearchSchema>;
export const vacancySchema = z.object({
  title: z.string().min(1).max(180),
  url: z.string().regex(/^https:\/\/github\.com\/(backend-br|frontendbr)\/vagas\/issues\/[1-9]\d*$/),
  source: z.enum(["Backend BR", "Frontend BR"]),
  publishedAt: z.string().datetime(),
  description: z.string().max(12000),
  labels: z.array(z.string().max(100)).max(30),
});
export const vacanciesSchema = z.object({
  items: z.array(vacancySchema).max(30),
  total: z.number().int().nonnegative(),
  incomplete: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type Vacancy = z.infer<typeof vacancySchema>;
