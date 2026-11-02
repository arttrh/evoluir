import { forwardToJava } from "../server/java-backend.js";
import type { ApiRequest, ApiResponse } from "../server/http.js";
import { jobSearchSchema } from "../src/jobs.js";
import { searchJobs } from "../server/job-search.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (await forwardToJava(req, res, "/api/jobs")) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const search = jobSearchSchema.safeParse(req.query);
  if (!search.success)
    return res.status(400).json({ error: "Confira os termos, a localização e a fonte da busca." });
  try {
    const result = await searchJobs(search.data);
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=900");
    return res.status(200).json(result);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({
      error: "A fonte de vagas está indisponível ou atingiu o limite de consultas. Tente novamente em alguns minutos.",
    });
  }
}
