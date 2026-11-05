import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("salva quilômetros com vírgula e ponto, preserva metros após recarregar",async({page})=>{
  await page.goto("/");await page.getByRole("navigation").getByRole("button",{name:"Corrida",exact:true}).click();
  for(const raw of ["4,1","4.2","4,125"]){
    await page.getByRole("button",{name:"Registrar corrida",exact:true}).click();
    await page.getByLabel("Distância (km)",{exact:true}).fill(raw);await page.getByLabel("Duração (min)",{exact:true}).fill("30,5");
    await page.getByRole("button",{name:"Salvar corrida",exact:true}).click();
  }
  await page.reload();await page.getByRole("navigation").getByRole("button",{name:"Corrida",exact:true}).click();
  const runs=await page.evaluate(()=>JSON.parse(localStorage.getItem("evoluir.data.v1")!).runs);
  expect(runs.map((r:any)=>r.distance).sort()).toEqual([4.1,4.125,4.2]);expect(runs.every((r:any)=>r.seconds===1830)).toBe(true);
  await expect(page.getByText("4,125 km",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("JetBrains tem filtro próprio, links reais e estado móvel acessível",async({page})=>{
  await page.route("**/api/news*",route=>route.fulfill({json:{items:[{title:"Java Annotated Monthly",url:"https://blog.jetbrains.com/idea/tag/java-annotated/",source:"JetBrains · Java Annotated Monthly",category:"Java",publishedAt:"2026-11-01T12:00:00Z"}],updatedAt:new Date().toISOString(),unavailableSources:[]}}));
  await page.goto("/");await page.getByRole("navigation").getByRole("button",{name:"Notícias",exact:true}).click();
  await page.getByRole("button",{name:"JetBrains",exact:true}).click();
  await expect(page.locator(".news-card")).toHaveCount(1);await expect(page.locator(".news-card h3 a")).toHaveAttribute("href","https://blog.jetbrains.com/idea/tag/java-annotated/");
  expect((await new AxeBuilder({page}).include(".news-page").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:"/tmp/prumo-news-mobile.png",fullPage:true});
});
