import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { sealedGupySchema } from "./gupy-session.js";

const text = z.string().trim().max(160).default("");
const money = z.union([z.literal(""), z.string().regex(/^\d{1,6}(?:\.\d{1,2})?$/).refine(v => Number(v) > 0 && Number(v) <= 100000)]).default("");
export const candidateSchema = z.object({
  fullName: text, email: z.union([z.literal(""), z.email().max(254)]).default(""),
  phone: z.string().trim().max(30).default(""),
  cpf: z.string().regex(/^(?:|\d{11})$/).refine(value => {
    if (!value) return true;
    if (/^(\d)\1{10}$/.test(value)) return false;
    return [9, 10].every(length => {
      const sum = [...value.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
      return ((sum * 10) % 11) % 10 === Number(value[length]);
    });
  }, "CPF inválido.").default(""),
  rg: z.string().trim().max(30).regex(/^[\p{L}\d.\-\s]*$/u).default(""),
  motherName: text, salaryJunior: money, salaryIntern: money,
  availability: text, answers: z.string().trim().max(6000).default(""),
}).strict();
export type Candidate = z.infer<typeof candidateSchema>;
export type Sealed = z.infer<typeof sealedGupySchema>;

export function digest(value: unknown): string {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical)
    : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v;
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

export function sealPrivate(value: unknown, key: string, purpose: string): Sealed {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("Chave privada indisponível.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  cipher.setAAD(Buffer.from(`evoluir:${purpose}:v1`));
  const bytes = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return sealedGupySchema.parse({ iv: iv.toString("hex"), tag: cipher.getAuthTag().toString("hex"), data: bytes.toString("base64") });
}

export function openPrivate(value: unknown, key: string, purpose: string): unknown {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("Chave privada indisponível.");
  const sealed = sealedGupySchema.parse(value);
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), Buffer.from(sealed.iv, "hex"));
  decipher.setAAD(Buffer.from(`evoluir:${purpose}:v1`));
  decipher.setAuthTag(Buffer.from(sealed.tag, "hex"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(sealed.data, "base64")), decipher.final()]).toString("utf8"));
}

export function maskedCandidate(profile: Candidate) {
  return `CPF: ${profile.cpf ? `***.***.***-${profile.cpf.slice(-2)}` : "não informado"}\nRG: ${profile.rg ? `***${profile.rg.slice(-2)}` : "não informado"}\nNome da mãe: ${profile.motherName ? "salvo no cadastro privado" : "não informado"}`;
}

const taskSchema = z.object({ id: z.string(), name: z.string().max(200), status: z.string().max(60), url: z.string().url(), deadline: z.string().optional() });
export const applicationSchema = z.object({
  status: z.enum(["review", "starting", "pending", "sent", "unknown", "cancelled"]),
  nonce: z.string().regex(/^[a-f0-9]{16}$/), expiresAt: z.number(), profileVersion: z.number().int(),
  snapshot: sealedGupySchema.optional(), snapshotHash: z.string().optional(),
  reviewedHash: z.string().optional(),
  applicationId: z.number().int().positive().optional(), registerStepId: z.number().int().positive().optional(),
  tasks: z.array(taskSchema).default([]), checkedAt: z.string().optional(), remindedAt: z.number().default(0),
  // Candidatura em 1 toque: a confirmação no Telegram cobre início e conclusão do cadastro.
  oneTap: z.boolean().optional(), error: z.string().max(80).optional(),
});
export const emailDraftSchema = z.object({
  to: z.email().max(254), subject: z.string().max(200), body: z.string().max(4000),
  status: z.enum(["draft", "sending", "sent", "failed"]), nonce: z.string().regex(/^[a-f0-9]{16}$/),
  expiresAt: z.number(), sentAt: z.string().optional(), error: z.string().max(80).optional(),
});
export const flowSchema = z.object({
  vault: sealedGupySchema.optional(), version: z.number().int().nonnegative().default(0),
  portal: z.object({ ticketHash: z.string(), ticketUntil: z.number(), sessionHash: z.string().optional(), sessionUntil: z.number().optional() }).optional(),
  applications: z.record(z.string(), applicationSchema).default({}),
  emails: z.record(z.string(), emailDraftSchema).default({}),
});
export type FlowState = z.infer<typeof flowSchema>;
