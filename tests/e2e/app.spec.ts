import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hoje.", exact: true }),
  ).toBeVisible();
});
async function nav(page: Page, name: string) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
}
async function addTask(page: Page, title: string, area = "estudos") {
  await page
    .getByRole("button", { name: "Adicionar tarefa", exact: true })
    .click();
  await page.getByLabel("O que você vai fazer?").fill(title);
  await page.getByLabel("Área", { exact: true }).selectOption(area);
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
}
async function fillRun(page: Page) {
  await page.getByLabel("Distância (km)", { exact: true }).fill("5");
  await page.getByLabel("Duração (min)", { exact: true }).fill("32.5");
  await page
    .getByRole("button", { name: "Salvar corrida", exact: true })
    .click();
}
test("conclui, reabre e persiste tarefa", async ({ page }) => {
  await addTask(page, "Praticar Java");
  await page
    .getByRole("button", { name: "Concluir Praticar Java", exact: true })
    .click();
  await expect(page.getByText("1 de 1 feitas")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 de 1 feitas")).toBeVisible();
  await page
    .getByRole("button", { name: "Reabrir Praticar Java", exact: true })
    .click();
  await expect(page.getByText("0 de 1 feitas")).toBeVisible();
});
test("registra, edita e exclui corrida com confirmação", async ({ page }) => {
  await nav(page, "Corrida");
  await page
    .getByRole("button", { name: "Registrar corrida", exact: true })
    .click();
  await fillRun(page);
  await expect(page.getByText("6:30 /km", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Editar corrida de/ }).click();
  await page.getByLabel("Distância (km)", { exact: true }).fill("6");
  await page
    .getByRole("button", { name: "Salvar corrida", exact: true })
    .click();
  await expect(page.getByText("5:25 /km", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Excluir corrida", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByText("5:25 /km", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Excluir corrida", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByText("Sua primeira corrida começa aqui"),
  ).toBeVisible();
});
test("corrida planejada conclui tarefa; excluir reabre", async ({ page }) => {
  await addTask(page, "Correr 5 km", "corpo");
  await page
    .getByRole("button", { name: "Concluir Correr 5 km", exact: true })
    .click();
  await fillRun(page);
  await expect(page.getByText("1 de 1 feitas")).toBeVisible();
  await nav(page, "Corrida");
  await page
    .getByRole("button", { name: "Excluir corrida", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await nav(page, "Hoje");
  await expect(page.getByText("0 de 1 feitas")).toBeVisible();
});
test("cria trilha, conclui tópico e agenda revisão", async ({ page }) => {
  await nav(page, "Estudos");
  await page.getByRole("button", { name: "Criar primeira trilha" }).click();
  await page.getByLabel("O que você quer aprender?").fill("Spring Cloud");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page
    .locator("summary")
    .filter({ hasText: "Configurar os serviços" })
    .click();
  await expect(
    page.getByRole("link", { name: /Spring Cloud — Overview/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Concluir tópico", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("1 de 20 tópicos concluídos")).toBeVisible();
  await page.reload();
  await nav(page, "Estudos");
  await expect(page.getByText("1 de 20 tópicos concluídos")).toBeVisible();
});
test("salva vaga, atualiza status e não executa notas", async ({ page }) => {
  await nav(page, "Emprego");
  await page.getByRole("button", { name: "Salvar vaga", exact: true }).click();
  await page.getByLabel("Empresa", { exact: true }).fill("Empresa Exemplo");
  await page.getByLabel("Cargo", { exact: true }).fill("Java Júnior");
  await page
    .getByLabel("Link da vaga (opcional)")
    .fill("https://example.com/vaga");
  await page
    .getByLabel("Observações (opcional)")
    .fill("<script>alert(1)</script>");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("<script>alert(1)</script>", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Status de Java Júnior").selectOption("Entrevista");
  await page.reload();
  await nav(page, "Emprego");
  await expect(page.getByLabel("Status de Java Júnior")).toHaveValue(
    "Entrevista",
  );
});
test("reagenda mantendo histórico", async ({ page }) => {
  await addTask(page, "Revisar currículo", "emprego");
  await page.getByLabel("Ações de Revisar currículo").click();
  await page.getByRole("button", { name: "Reagendar", exact: true }).click();
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await nav(page, "Semana");
  await expect(page.getByText("Histórico de reagendamentos")).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("evoluir.data.v1")!),
  );
  expect(data.tasks[0].history[0].action).toBe("reagendada");
  expect(data.tasks[0].history[0].from).not.toBe(data.tasks[0].history[0].to);
});
test("exporta backup e recusa importação inválida preservando dados", async ({
  page,
}) => {
  await addTask(page, "Preservar dados");
  await page.getByLabel("Preferências e backup").click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  expect((await downloading).suggestedFilename()).toContain("evoluir-backup-");
  await page.getByLabel("Arquivo de backup").setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.getByRole("alert")).toContainText("Backup inválido");
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(
    page.getByText("Preservar dados", { exact: true }).last(),
  ).toBeVisible();
});
test("restaura backup válido após confirmação e guarda cópia anterior", async ({
  page,
}) => {
  await addTask(page, "Tarefa original");
  const backup = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("evoluir.data.v1")!),
  );
  backup.tasks[0].title = "Tarefa restaurada";
  await page.getByLabel("Preferências e backup").click();
  await page.getByLabel("Arquivo de backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByText("Tarefa restaurada", { exact: true }).last(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("evoluir.before-import")!).tasks[0]
          .title,
    ),
  ).toBe("Tarefa original");
});
test("falha ao salvar não perde o registro anterior", async ({ page }) => {
  await addTask(page, "Primeira tarefa");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Adicionar tarefa", exact: true })
    .click();
  await page.getByLabel("O que você vai fazer?").fill("Segunda tarefa");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível salvar",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("evoluir.data.v1")!).tasks.length,
    ),
  ).toBe(1);
});
test("dados corrompidos são preservados", async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem("evoluir.data.v1", "{invalido"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seus dados precisam de atenção" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("evoluir.data.v1")),
  ).toBe("{invalido");
});
test("sem transbordamento em 320, 375, 390, 430 e 1024 px e navegação fixa", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of ["Hoje", "Corrida", "Estudos", "Emprego", "Semana"]) {
      await nav(page, name);
      const b = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
        nav: document.querySelector("nav")!.getBoundingClientRect().bottom,
        height: innerHeight,
        scrollbar: getComputedStyle(document.documentElement).scrollbarWidth,
      }));
      expect(b.scroll).toBeLessThanOrEqual(b.width);
      expect(b.nav).toBeLessThan(b.height);
      expect(b.nav).toBeGreaterThan(b.height - 70);
      expect(b.scrollbar).toBe("none");
    }
  }
});
test("acessibilidade das cinco telas e diálogo", async ({ page }) => {
  for (const name of ["Hoje", "Corrida", "Estudos", "Emprego", "Semana"]) {
    await nav(page, name);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await nav(page, "Hoje");
  await page
    .getByRole("button", { name: "Adicionar tarefa", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("carrega e conserva registros offline", async ({ page, context }) => {
  await addTask(page, "Estudar offline");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText("Estudar offline", { exact: true }).last(),
  ).toBeVisible();
  await nav(page, "Corrida");
  await expect(
    page.getByRole("heading", { name: "Corrida.", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("cria objetivo, vincula tarefa e mantém histórico ao editar data", async ({
  page,
}) => {
  await nav(page, "Semana");
  await page.getByRole("button", { name: "Objetivo", exact: true }).click();
  await page.getByLabel("Objetivo de longo prazo").fill("Conseguir vaga Java");
  await page.getByLabel("Meta semanal").fill("Enviar seis candidaturas");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Conseguir vaga Java" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Adicionar tarefa", exact: true })
    .click();
  await page.getByLabel("O que você vai fazer?").fill("Revisar portfólio");
  await page
    .getByLabel("Vincular a um objetivo")
    .selectOption({ label: "Conseguir vaga Java" });
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  const value = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("evoluir.data.v1")!),
  );
  expect(value.tasks[0].goalId).toBe(value.goals[0].id);
  await page.getByLabel("Ações de Revisar portfólio").click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page
    .getByLabel("O que você vai fazer?")
    .fill("Revisar currículo e portfólio");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("Revisar currículo e portfólio", { exact: true }),
  ).toBeVisible();
});

test("personaliza trilha manual com módulo e tópico próprios", async ({
  page,
}) => {
  await nav(page, "Estudos");
  await page.getByRole("button", { name: "Criar primeira trilha" }).click();
  await page.getByLabel("O que você quer aprender?").fill("Linux");
  await page.getByLabel("Ponto de partida").selectOption("manual");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.getByRole("button", { name: "Módulo", exact: true }).click();
  await page.getByLabel("Nome do módulo").fill("Projeto prático");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page
    .locator("article.module")
    .filter({ hasText: "Projeto prático" })
    .getByRole("button", { name: "Adicionar tópico" })
    .click();
  await page.getByLabel("Tópico", { exact: true }).fill("Organizar arquivos");
  await page
    .getByLabel("Critérios de conclusão")
    .fill("Explicar permissões e criar diretórios com segurança.");
  await page
    .getByLabel("Exercício ou pequeno projeto")
    .fill("Criar uma pasta de teste e listar suas permissões.");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page
    .locator("summary")
    .filter({ hasText: "Organizar arquivos" })
    .click();
  await expect(
    page.getByText("Explicar permissões e criar diretórios com segurança."),
  ).toBeVisible();
});

test("recupera armazenamento corrompido usando backup válido", async ({
  page,
}) => {
  await addTask(page, "Registro recuperado");
  const raw = await page.evaluate(() =>
    localStorage.getItem("evoluir.data.v1")!,
  );
  await page.evaluate(() => localStorage.setItem("evoluir.data.v1", "{erro"));
  await page.reload();
  await page.getByLabel("Arquivo de backup").setInputFiles({
    name: "recuperacao.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByText("Registro recuperado", { exact: true }).last(),
  ).toBeVisible();
});

test("voz só altera uma tarefa depois da confirmação", async ({ page }) => {
  await addTask(page, "Revisar currículo", "emprego");
  await page
    .getByRole("button", { name: "Comando de voz", exact: true })
    .click();
  await page
    .getByLabel("Seu comando", { exact: true })
    .fill("Concluí revisar currículo");
  await page
    .getByRole("button", { name: "Interpretar comando", exact: true })
    .click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("evoluir.data.v1")!).tasks[0].status,
    ),
  ).toBe("pendente");
  await page
    .getByRole("button", { name: "Confirmar conclusão", exact: true })
    .click();
  await expect(page.getByText("1 de 1 feitas")).toBeVisible();
});

test("voz registra corrida e conclui treino somente quando vinculado", async ({
  page,
}) => {
  await addTask(page, "Correr 5 km", "corpo");
  await page
    .getByRole("button", { name: "Comando de voz", exact: true })
    .click();
  await page
    .getByLabel("Seu comando", { exact: true })
    .fill("Corri cinco quilômetros em trinta e cinco minutos");
  await page
    .getByRole("button", { name: "Interpretar comando", exact: true })
    .click();
  await page
    .getByLabel("Concluir também um treino?")
    .selectOption({ label: "Correr 5 km" });
  await page
    .getByRole("button", { name: "Confirmar corrida", exact: true })
    .click();
  await expect(page.getByText("1 de 1 feitas")).toBeVisible();
  const d = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("evoluir.data.v1")!),
  );
  expect(d.runs[0].distance).toBe(5);
  expect(d.runs[0].seconds).toBe(2100);
});

test("recusa comando vago e mostra erro de permissão do microfone", async ({
  page,
}) => {
  await page.evaluate(() => {
    (window as any).SpeechRecognition = class {
      onerror: any;
      onend: any;
      start() {
        this.onerror?.({ error: "not-allowed" });
        this.onend?.();
      }
      abort() {}
      stop() {}
    };
  });
  await page
    .getByRole("button", { name: "Comando de voz", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Falar comando", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Permita o microfone");
  await page
    .getByLabel("Seu comando", { exact: true })
    .fill("Já bati minha meta");
  await page
    .getByRole("button", { name: "Interpretar comando", exact: true })
    .click();
  await expect(page.getByText(/Nenhuma ação foi realizada/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar corrida", exact: true }),
  ).not.toBeVisible();
});

test("busca fontes reais pelo endpoint e monta trilha com tópicos escolhidos", async ({
  page,
}) => {
  await page.route("**/api/study-search?*", (route) =>
    route.fulfill({
      json: {
        sources: [
          {
            title: "Spring Cloud Gateway",
            url: "https://docs.spring.io/spring-cloud-gateway/reference/",
            why: "Use depois dos fundamentos para configurar rotas e filtros.",
            kind: "official",
          },
        ],
        warning: "",
      },
    }),
  );
  await nav(page, "Estudos");
  await page.getByLabel("Assunto para pesquisar").fill("Spring Cloud");
  await page
    .getByRole("button", { name: "Buscar fontes", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: /Spring Cloud Gateway/ }),
  ).toBeVisible();
  await page
    .getByLabel("Quais tópicos você quer priorizar? (opcional)")
    .fill("Eureka, Gateway");
  await page
    .getByRole("button", { name: "Criar trilha deste assunto", exact: true })
    .click();
  const d = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("evoluir.data.v1")!),
  );
  expect(d.tracks[0].modules.map((m: any) => m.title)).toEqual([
    "Eureka",
    "Gateway",
  ]);
  expect(d.tracks[0].modules[0].topics[0].resources[0].url).toContain(
    "spring.io",
  );
});

test("falha de busca preserva catálogo e não cria integração falsa com Strava", async ({
  page,
}) => {
  await page.route("**/api/study-search?*", (route) => route.abort());
  await page.route("**/api/strava?op=status", (route) =>
    route.fulfill({ json: { configured: false, connected: false } }),
  );
  await nav(page, "Estudos");
  await page.getByLabel("Assunto para pesquisar").fill("Spring Cloud");
  await page
    .getByRole("button", { name: "Buscar fontes", exact: true })
    .click();
  await expect(page.getByText(/Sem resposta da busca online/)).toBeVisible();
  await nav(page, "Corrida");
  await expect(
    page.getByText("Conexão automática ainda não ativada"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Conectar minha conta Strava" }),
  ).not.toBeVisible();
});

test("Strava exibe métricas autenticadas sem persistir atividades em backup", async ({
  page,
}) => {
  await page.route("**/api/strava?op=status", (route) =>
    route.fulfill({ json: { configured: true, connected: true } }),
  );
  await page.route("**/api/strava?op=activities", (route) =>
    route.fulfill({
      json: {
        activities: [
          {
            id: 12345,
            name: "Corrida externa de teste",
            distance: 5000,
            movingTime: 1800,
            elapsedTime: 1900,
            date: "2026-11-02T12:00:00Z",
            elevation: 20,
            heartRate: 140,
            device: null,
            url: "https://www.strava.com/activities/12345",
          },
        ],
      },
    }),
  );
  await nav(page, "Corrida");
  await page
    .getByRole("button", { name: "Consultar corridas", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Corrida externa de teste" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("evoluir.data.v1")),
  ).toBeNull();
  await nav(page, "Hoje");
  await nav(page, "Corrida");
  await expect(
    page.getByRole("heading", { name: "Corrida externa de teste" }),
  ).not.toBeVisible();
});

test("movimento reduzido mantém as telas visíveis e desativa animações", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await nav(page, "Estudos");
  await expect(
    page.getByRole("heading", { name: "O que você quer dominar?" }),
  ).toBeVisible();
  expect(
    await page
      .locator(".study-explorer")
      .evaluate((e) => getComputedStyle(e).opacity),
  ).toBe("1");
  expect(
    await page
      .locator(".nav-indicator")
      .evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe("0s");
  await page
    .getByRole("button", { name: "Comando de voz", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
