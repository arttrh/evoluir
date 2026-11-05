import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {emptyData} from "../../src/model";

test("pesquisa várias fontes por assunto, filtra por tipo e preserva progresso no iPhone",async({page})=>{
 const before=JSON.stringify(emptyData());await page.addInitScript(value=>localStorage.setItem("evoluir.data.v1",value),before);
 await page.route("**/api/learning",route=>route.fulfill({json:{syncedAt:new Date().toISOString(),sessions:[]}}));
 const requested:string[]=[];
 await page.route("**/api/study-search?*",route=>{
  const q=new URL(route.request().url()).searchParams.get('q')!;requested.push(q);
  return route.fulfill({json:{query:q,searchedAt:'2026-11-05T00:00:00Z',warning:'A busca não respondeu em: Reddit. As buscas diretas continuam disponíveis.',sources:[
   {title:`Documentação ${q}`,url:'https://docs.python.org/3/library/asyncio.html',kind:'official',why:'Documentação oficial da linguagem.'},
   {title:`Tutorial ${q}`,url:'https://www.baeldung.com/example',kind:'article',publisher:'Baeldung',why:'Artigo para comparar com a documentação.'},
   {title:`Discussão ${q}`,url:'https://news.ycombinator.com/item?id=7',kind:'community',publisher:'Hacker News',why:'Discussão pública da comunidade.'}
  ]}});
 });
 await page.goto('/');await page.getByRole('navigation').getByRole('button',{name:'Estudos',exact:true}).click();
 const search=page.getByLabel('Assunto para pesquisar');await search.fill('Python asyncio');await page.getByRole('button',{name:'Buscar fontes',exact:true}).click();
 await expect(page.getByText('Tutorial Python asyncio',{exact:true})).toBeVisible();
 const filters=page.getByRole('group',{name:'Tipos de fonte'});await filters.getByRole('button',{name:'Artigos e tutoriais',exact:true}).click();
 await expect(page.locator('.source-result')).toHaveCount(1);await expect(page.locator('.source-kind')).toHaveText('Artigo / tutorial · Baeldung');
 await filters.getByRole('button',{name:'Discussões',exact:true}).click();await expect(page.locator('.source-kind')).toHaveText('Discussão · Hacker News');
 await page.getByText('Pesquisar também nas fontes',{exact:true}).click();
 await expect(page.locator('.study-search-links').getByRole('link',{name:'Reddit',exact:true})).toHaveAttribute('href','https://www.reddit.com/search/?q=Python%20asyncio');
 await search.fill('Go channels');await page.getByRole('button',{name:'Buscar fontes',exact:true}).click();
 await expect(page.getByText('Tutorial Go channels',{exact:true})).toBeVisible();expect(requested).toEqual(['Python asyncio','Go channels']);
 expect(await page.evaluate(()=>localStorage.getItem('evoluir.data.v1'))).toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.study-explorer').analyze()).violations).toEqual([]);
 await page.screenshot({path:'/tmp/prumo-study-search-mobile.png',fullPage:true});
});
