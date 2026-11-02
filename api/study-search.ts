import type {
  ApiRequest as VercelRequest,
  ApiResponse as VercelResponse,
} from "../server/http.js";
import { officialSources, type StudySource } from "../src/study-sources.js";
import { z } from "zod";
const upstream = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      link: z.string().url(),
      score: z.number(),
      is_answered: z.boolean(),
    }),
  ),
  backoff: z.number().optional(),
  error_id: z.number().optional(),
});
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método não permitido." });
  const query = z.string().trim().min(2).max(120).safeParse(req.query.q);
  if (!query.success)
    return res
      .status(400)
      .json({ error: "Informe um assunto entre 2 e 120 caracteres." });
  const sources: StudySource[] = officialSources(query.data);
  let warning = "";
  try {
    const url = new URL("https://api.stackexchange.com/2.3/search/advanced");
    url.search = new URLSearchParams({
      site: "stackoverflow",
      q: query.data,
      pagesize: "5",
      order: "desc",
      sort: "votes",
      accepted: "true",
      closed: "false",
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error();
    const result = upstream.parse(await response.json());
    if (result.backoff || result.error_id) throw new Error();
    for (const item of result.items) {
      if (new URL(item.link).hostname !== "stackoverflow.com") continue;
      sources.push({
        title: item.title,
        url: item.link,
        kind: "community",
        why: `Discussão com resposta aceita e ${item.score} votos. Use depois dos fundamentos para investigar dúvidas e comparar soluções; confira as versões citadas.`,
      });
    }
  } catch {
    warning =
      "A busca na comunidade não respondeu. As referências oficiais continuam disponíveis.";
  }
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  return res
    .status(200)
    .json({
      query: query.data,
      sources,
      warning,
      searchedAt: new Date().toISOString(),
    });
}
