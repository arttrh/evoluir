import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const folder = join(homedir(), ".config", "evoluir-telegram");
let secrets; let deployment;
try {
  secrets = JSON.parse(readFileSync(join(folder, "cloud-secrets.json"), "utf8"));
  deployment = JSON.parse(readFileSync(join(folder, "deployment.json"), "utf8"));
} catch { console.error("A configuração privada da conexão não está disponível."); process.exit(1); }
if (!/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(deployment.url) || !/^[a-f0-9]{64}$/.test(secrets.gupyKey || ""))
  throw new Error("Conexão da Gupy ainda não foi configurada neste computador.");
const vite = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), configFile: false,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom", logLevel: "silent" });
let browser;
try {
  const { gupyAccountUrl, sealGupySession } = await vite.ssrLoadModule("/server/gupy-session.ts");
  await vite.close();
  browser = await chromium.launch({ headless: false, executablePath: "/usr/bin/chromium" });
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log("Entre na janela oficial da Gupy. Senha e código ficam nessa janela, sem registro no terminal.");
  console.log("Após o login, a autorização da sessão será cifrada e enviada ao seu bot para verificação. Nenhuma candidatura será enviada.");
  const authenticated = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Login não concluído em dez minutos.")), 600000);
    browser.on("disconnected", () => { clearTimeout(timer); reject(new Error("Janela fechada.")); });
    context.on("response", async response => {
      if (response.url() !== gupyAccountUrl || response.status() !== 200) return;
      try {
        const headers = await response.request().allHeaders();
        const session = { authorization: headers.authorization, cookie: headers.cookie, userAgent: headers["user-agent"] };
        if (!session.authorization && !session.cookie) return;
        clearTimeout(timer); resolve(session);
      } catch { /* Uma resposta sem credencial não conclui a conexão. */ }
    });
  });
  const [, session] = await Promise.all([
    page.goto("https://login.gupy.io/candidates/signin", { waitUntil: "domcontentloaded", timeout: 30000 }), authenticated,
  ]);
  const response = await fetch(`${deployment.url}/gupy/connect`, { method: "POST", redirect: "error",
    headers: { Authorization: `Bearer ${secrets.store}`, "Content-Type": "application/json" },
    body: JSON.stringify(sealGupySession(session, secrets.gupyKey)), signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error("O servidor não confirmou a conexão. Confira /gupy no Telegram.");
  console.log("Gupy conectada e verificada pelo servidor. Confira a confirmação no Telegram.");
} catch {
  console.error("A conexão não foi confirmada. Confira se o login terminou, se a conta do bot está vinculada e tente novamente. Credenciais omitidas.");
  process.exitCode = 1;
} finally { await browser?.close(); await vite.close(); }
