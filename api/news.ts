import type { ApiRequest, ApiResponse } from "../server/http.js";
import { fetchNews } from "../server/news-feeds.js";
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método não permitido." });
  const result = await fetchNews();
  if (!result.items.length)
    return res
      .status(503)
      .json({
        error:
          "As fontes de notícias não responderam agora. Tente novamente em alguns minutos.",
      });
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=3600",
  );
  return res.status(200).json(result);
}
