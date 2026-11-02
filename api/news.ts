import { forwardToJava } from "../server/java-backend.js";
import type { ApiRequest, ApiResponse } from "../server/http.js";
import { z } from "zod";
import { fetchNews } from "../server/news-feeds.js";
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (await forwardToJava(req, res, "/api/news")) return;
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método não permitido." });
  const query = z
    .string()
    .trim()
    .max(120)
    .safeParse(req.query.q ?? "");
  if (!query.success)
    return res
      .status(400)
      .json({ error: "O assunto deve ter até 120 caracteres." });
  const page = z.coerce
    .number()
    .int()
    .min(0)
    .max(9)
    .safeParse(req.query.page ?? 0);
  const fresh = z.enum(["0", "1"]).safeParse(req.query.fresh ?? "0");
  if (!page.success || !fresh.success)
    return res
      .status(400)
      .json({ error: "Página ou modo de atualização inválido." });
  const result = await fetchNews(query.data, page.data);
  if (!result.items.length && result.unavailableSources.length)
    return res.status(503).json({
      error:
        "As fontes de notícias não responderam agora. Tente novamente em alguns minutos.",
    });
  res.setHeader(
    "Cache-Control",
    fresh.data === "1"
      ? "no-store"
      : "public, s-maxage=60, stale-while-revalidate=120",
  );
  return res.status(200).json(result);
}
