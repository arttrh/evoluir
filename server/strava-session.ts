import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import { z } from "zod";
export const tokenSchema = z.object({
  access_token: z.string().min(1).max(1000),
  refresh_token: z.string().min(1).max(1000),
  expires_at: z.number().int().positive(),
});
export type StravaToken = z.infer<typeof tokenSchema>;
export function seal(value: unknown, secret: string) {
  const iv = randomBytes(12);
  const key = createHash("sha256").update(secret).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}
export function unseal(value: string, secret: string): unknown {
  const raw = Buffer.from(value, "base64url");
  if (raw.length < 29) throw new Error("Sessão inválida.");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secret).digest(),
    raw.subarray(0, 12),
  );
  cipher.setAuthTag(raw.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([cipher.update(raw.subarray(28)), cipher.final()]).toString(
      "utf8",
    ),
  );
}
export function readCookies(
  header: string | undefined,
): Record<string, string> {
  return Object.fromEntries(
    (header || "")
      .split(";")
      .map((c) => c.trim().split(/=(.*)/s).slice(0, 2))
      .filter(([k, v]) => k && v !== undefined),
  );
}
