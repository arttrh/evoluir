import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const vite = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), configFile: false,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom", logLevel: "silent" });
try {
  const { startTelegramWeb } = await vite.ssrLoadModule("/server/telegram-cloud.ts");
  await vite.close();
  const server = await startTelegramWeb(process.env);
  process.on("SIGTERM", () => { server.close(() => process.exit(0)); });
} catch {
  console.error("Não foi possível iniciar o bot; configuração e credenciais omitidas.");
  process.exitCode = 1;
} finally { await vite.close(); }
