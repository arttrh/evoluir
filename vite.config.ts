import {
  defineConfig,
  loadEnv,
  type PreviewServer,
  type ViteDevServer,
} from "vite";
import react from "@vitejs/plugin-react";
import search from "./api/study-search.js";
import strava from "./api/strava.js";
import news from "./api/news.js";
import jobs from "./api/jobs.js";
import learning from "./api/learning.js";
import type { ApiRequest, ApiResponse } from "./server/http.js";
function localApi(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (
      !["/api/study-search", "/api/strava", "/api/news", "/api/jobs", "/api/learning"].includes(url.pathname)
    )
      return next();
    const request = req as ApiRequest;
    const response = res as ApiResponse;
    request.query = Object.fromEntries(url.searchParams);
    response.status = (code) => {
      response.statusCode = code;
      return response;
    };
    response.json = (body) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(body));
      return response;
    };
    response.redirect = (code, location) => {
      response.statusCode = code;
      response.setHeader("Location", location);
      response.end();
      return response;
    };
    try {
      await (
        url.pathname === "/api/learning"
          ? learning
          : url.pathname === "/api/jobs"
          ? jobs
          : url.pathname === "/api/strava"
          ? strava
          : url.pathname === "/api/news"
            ? news
            : search
      )(request, response);
    } catch {
      response
        .status(500)
        .json({ error: "O serviço não está disponível agora." });
    }
  });
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "APP_ORIGIN",
    "JAVA_BACKEND_URL",
    "JAVA_BACKEND_KEY",
    "LEARNHARNESS_URL",
    "PRUMO_STORE_URL",
    "PRUMO_GATEWAY_KEY",
    "STRAVA_CLIENT_ID",
    "STRAVA_CLIENT_SECRET",
    "STRAVA_SESSION_SECRET",
  ])
    if (env[key]) process.env[key] = env[key];
  return {
    plugins: [
      react(),
      {
        name: "evoluir-local-api",
        configureServer: localApi,
        configurePreviewServer: localApi,
      },
    ],
  };
});
