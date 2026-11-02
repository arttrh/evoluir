import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const vacancy = {
  title: "[Remoto] Java Júnior na Empresa Exemplo",
  url: "https://github.com/backend-br/vagas/issues/123",
  source: "Backend BR",
  publishedAt: new Date().toISOString(),
  description: "Envie o currículo pelo site da empresa. <script>alert(1)</script>",
  labels: ["Júnior", "Remoto"],
};
const payload = { items: [vacancy], total: 1, incomplete: false, updatedAt: new Date().toISOString() };
async function nav(page: Page) {
  await page.getByRole("navigation").getByRole("button", { name: "Emprego", exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.route("**/api/jobs?*", (route) => route.fulfill({ json: payload }));
  await page.goto("/");
  await nav(page);
  await expect(page.getByRole("heading", { name: vacancy.title })).toBeVisible();
});
test("busca, salva sem duplicar e confirma o envio somente depois da candidatura", async ({ page }) => {
  await page.getByLabel("Cargo, tecnologia ou nível").fill("Java júnior");
  await page.getByLabel("Localização ou modalidade").fill("Remoto");
  const request = page.waitForRequest((req) => req.url().includes("/api/jobs?") && req.url().includes("Java"));
  await page.getByRole("button", { name: "Buscar vagas", exact: true }).click();
  expect(new URL((await request).url()).searchParams.get("q")).toBe("Java júnior");
  await page.getByText("Descrição e instruções de candidatura", { exact: true }).click();
  await expect(page.getByText(vacancy.description, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver anúncio" })).toHaveAttribute("href", vacancy.url);
  await page.getByRole("button", { name: "Salvar oportunidade", exact: true }).click();
  await expect(page.getByLabel("Cargo", { exact: true })).toHaveValue(vacancy.title);
  await page.getByLabel("Empresa", { exact: true }).fill("Empresa Exemplo");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Já salva no painel" })).toBeDisabled();
  const status = page.getByLabel(`Status de ${vacancy.title}`);
  await expect(status).toHaveValue("Encontrada");
  await page.getByRole("button", { name: "Confirmar currículo enviado", exact: true }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(status).toHaveValue("Encontrada");
  await page.getByRole("button", { name: "Confirmar currículo enviado", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(status).toHaveValue("Candidatura enviada");
  await expect(page.getByText(/Envio confirmado em/)).toBeVisible();
  await page.reload();
  await nav(page);
  await expect(page.getByLabel(`Status de ${vacancy.title}`)).toHaveValue("Candidatura enviada");
  const jobs = await page.evaluate(() => JSON.parse(localStorage.getItem("evoluir.data.v1")!).jobs);
  expect(jobs).toHaveLength(1);
  expect(jobs[0].appliedAt).toBeTruthy();
});
test("falha da busca preserva candidaturas e busca vazia é explícita", async ({ page }) => {
  await page.route("**/api/jobs?*", (route) => route.fulfill({ status: 503, json: { error: "limite" } }));
  await page.getByRole("button", { name: "Buscar vagas", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Não foi possível buscar vagas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar vaga", exact: true })).toBeVisible();
  await page.route("**/api/jobs?*", (route) => route.fulfill({ json: { ...payload, items: [], total: 0 } }));
  await page.getByRole("button", { name: "Buscar vagas", exact: true }).click();
  await expect(page.getByText("Nenhuma vaga encontrada.", { exact: false })).toBeVisible();
});
test("a área Emprego não tem violações de acessibilidade nem transbordamento no celular", async ({ page }) => {
  expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test("atualização automática respeita a opção e para ao sair da tela", async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  page.on("request", (request) => { if (request.url().includes("/api/jobs?")) requests++; });
  await page.clock.fastForward(15 * 60 * 1000);
  expect(requests).toBe(0);
  await page.getByLabel("Atualizar esta busca a cada 15 minutos com a tela aberta").check();
  await page.clock.fastForward(15 * 60 * 1000);
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByRole("button", { name: "Buscar vagas", exact: true })).toBeEnabled();
  await page.getByRole("navigation").getByRole("button", { name: "Hoje", exact: true }).click();
  await page.clock.fastForward(15 * 60 * 1000);
  expect(requests).toBe(1);
});
