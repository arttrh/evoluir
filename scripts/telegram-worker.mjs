import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const configFile = process.argv[2];
if (!configFile) throw new Error("Informe o caminho do JSON privado de configuração.");
const root = fileURLToPath(new URL("../", import.meta.url));
const vite = await createServer({ root, configFile: false, server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom", logLevel: "silent" });
try {
  const { TelegramWorker, telegramConfigSchema } = await vite.ssrLoadModule("/server/telegram.ts");
  await vite.close();
  const config = telegramConfigSchema.parse(JSON.parse(readFileSync(configFile, "utf8")));
  await new TelegramWorker(config, resolve(dirname(configFile), "state.json")).run();
} catch (error) {
  const safeMessage = typeof error?.message === "string" && /^(Falha Telegram em [a-zA-Z]+; detalhes omitidos para proteger o token\.|Token Telegram inválido\.|O token pertence a outro bot\.|Este bot já tem webhook\. Configuração existente preservada\.|Estado Telegram inválido; arquivo preservado\.|Busca de vagas indisponível\.)$/.test(error.message);
  console.error(safeMessage ? error.message : "Automação interrompida. Verifique conexão, configuração e estado privado; detalhes omitidos.");
  process.exitCode = 1;
} finally { await vite.close(); }
