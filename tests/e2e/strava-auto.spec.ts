import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {emptyData} from "../../src/model";
const activity={id:12345,name:"Corrida automática de teste",distance:4100,movingTime:1500,elapsedTime:1600,date:"2026-11-02T12:00:00Z",elevation:20,heartRate:null,device:null,url:"https://www.strava.com/activities/12345"};
async function running(page:import('@playwright/test').Page){await page.getByRole('navigation').getByRole('button',{name:'Corrida',exact:true}).click();}
test("carrega automaticamente, atualiza sem duplicar e preserva corridas manuais",async({page})=>{
 const data=emptyData();data.runs.push({id:'manual-before',date:'2026-11-02',distance:3.1,seconds:1200,notes:'Minha corrida manual',taskId:null});const before=JSON.stringify(data);
 await page.addInitScript(value=>{if(!localStorage.getItem('evoluir.data.v1'))localStorage.setItem('evoluir.data.v1',value)},before);
 let count=0;await page.route('**/api/strava?op=status',route=>route.fulfill({json:{configured:true,connected:true}}));
 await page.route('**/api/strava?op=activities',route=>{count++;return route.fulfill({json:{activities:[activity,activity],checkedAt:new Date().toISOString()}})});
 await page.goto('/');await running(page);const panel=page.locator('.strava-panel');
 await expect(panel.getByRole('heading',{name:activity.name})).toBeVisible();await expect(panel.getByText('Realizada no Strava',{exact:true})).toHaveCount(1);
 await panel.getByRole('button',{name:'Atualizar corridas',exact:true}).click();await expect(panel.getByRole('button',{name:'Atualizar corridas',exact:true})).toBeEnabled();
 expect(count).toBe(2);await expect(panel.getByRole('heading',{name:activity.name})).toHaveCount(1);
 await page.reload();await running(page);await expect(panel.getByRole('heading',{name:activity.name})).toBeVisible();expect(count).toBe(3);
 expect(await page.evaluate(()=>localStorage.getItem('evoluir.data.v1'))).toBe(before);
 await expect(page.getByText('Minha corrida manual',{exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.strava-panel').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("não consulta sem autorização e exibe erro sem inventar corrida realizada",async({page})=>{
 let connected=false,requests=0;await page.route('**/api/strava?op=status',route=>route.fulfill({json:{configured:true,connected}}));
 await page.route('**/api/strava?op=activities',route=>{requests++;return route.fulfill({status:401,json:{error:'Autorização expirada. Conecte novamente.'}})});
 await page.goto('/');await running(page);await expect(page.getByRole('button',{name:'Conectar minha conta Strava',exact:true})).toBeVisible();expect(requests).toBe(0);
 connected=true;await page.reload();await running(page);
 await expect(page.getByText('Autorização expirada. Conecte novamente.',{exact:true})).toBeVisible();await expect(page.locator('.external-run')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Conectar minha conta Strava',exact:true})).toBeVisible();expect(requests).toBe(1);
});
test("atualiza somente na tela visível e limpa dados ao desconectar",async({page})=>{
 await page.clock.install();let count=0;await page.route('**/api/strava?op=status',route=>route.fulfill({json:{configured:true,connected:true}}));
 await page.route('**/api/strava?op=activities',route=>{count++;return route.fulfill({json:{activities:[activity]}})});
 await page.route('**/api/strava?op=disconnect',route=>route.fulfill({json:{disconnected:true}}));
 await page.goto('/');await running(page);const panel=page.locator('.strava-panel');await expect(panel.getByRole('heading',{name:activity.name})).toBeVisible();
 await page.clock.fastForward(300000);await expect.poll(()=>count).toBe(2);await expect(panel.getByRole('button',{name:'Atualizar corridas',exact:true})).toBeEnabled();
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(panel.locator('.external-run')).toHaveCount(0);await page.clock.fastForward(600000);expect(count).toBe(2);
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(panel.getByRole('heading',{name:activity.name})).toBeVisible();expect(count).toBe(3);
 await panel.getByRole('button',{name:'Desconectar',exact:true}).click();await panel.getByRole('button',{name:'Confirmar desconexão',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Conectar minha conta Strava',exact:true})).toBeVisible();await expect(panel.locator('.external-run')).toHaveCount(0);
 await page.clock.fastForward(600000);expect(count).toBe(3);
});
