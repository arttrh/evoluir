import { forwardToJava } from "../server/java-backend.js";
import type {
  ApiRequest as VercelRequest,
  ApiResponse as VercelResponse,
} from "../server/http.js";
import { z } from "zod";
import { searchStudy } from "../server/study-search.js";
export const maxDuration = 60;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (await forwardToJava(req, res, "/api/study-search")) return;
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método não permitido." });
  const query = z.string().trim().min(2).max(120).safeParse(req.query.q);
  if (!query.success)
    return res
      .status(400)
      .json({ error: "Informe um assunto entre 2 e 120 caracteres." });
  const result = await searchStudy(query.data);
  res.setHeader(
    "Cache-Control",
    "private, no-store",
  );
  return res.status(200).json(result);
}
