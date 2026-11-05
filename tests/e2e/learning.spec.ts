import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyData } from "../../src/model";
import { createTrack } from "../../src/catalog";

test("sincroniza e vincula sem duplicar sessão ou alterar progresso no iPhone", async ({page})=>{
  const data=emptyData();const track=createTrack("Java","auto");data.tracks.push(track);
  const topic=track.modules[0]!.topics[0]!;topic.done=false;topic.criteria="Critério que deve ser preservado";
  const before=JSON.stringify(data);
  await page.addInitScript(value=>{if(!localStorage.getItem("evoluir.data.v1"))localStorage.setItem("evoluir.data.v1",value);},before);
  let link:null|{trackId:string;topicId:string}=null, fail=false;
  const now=new Date().toISOString();
  await page.route("**/api/learning",async route=>{
    if(route.request().method()==="POST"){
      const body=route.request().postDataJSON();expect(body).toEqual({sessionId:"session-test",trackId:track.id,topicId:topic.id});
      link={trackId:body.trackId,topicId:body.topicId};return route.fulfill({json:{saved:true}});
    }
    if(fail)return route.fulfill({status:503,json:{error:"indisponível"}});
    return route.fulfill({json:{syncedAt:now,sessions:[{id:"session-test",title:"Sessão de teste",createdAt:now,updatedAt:now,link,topics:[{id:"one",title:"Fundamentos",status:"visited"},{id:"two",title:"Prática",status:"current"},{id:"three",title:"Revisão",status:"upcoming"}]}]}});
  });
  await page.goto("/");await page.getByRole("navigation").getByRole("button",{name:"Estudos",exact:true}).click();
  const panel=page.locator(".learning-panel");await expect(panel.getByRole("heading",{name:"Sessão de teste",exact:true})).toBeVisible();
  await expect(panel.getByText("Visitado",{exact:true})).toBeVisible();await expect(panel.getByText("Atual",{exact:true})).toBeVisible();await expect(panel.getByText("Futuro",{exact:true})).toBeVisible();
  await panel.getByLabel("Tópico de Sessão de teste").selectOption(`${track.id}/${topic.id}`);
  await expect(panel.getByRole("button",{name:"Atualizar"})).toBeEnabled();
  await panel.getByRole("button",{name:"Atualizar"}).click();
  await expect(panel.getByRole("heading",{name:"Sessão de teste",exact:true})).toHaveCount(1);
  expect(await page.evaluate(()=>localStorage.getItem("evoluir.data.v1"))).toBe(before);
  expect((await new AxeBuilder({page}).include(".learning-panel").analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  fail=true;await panel.getByRole("button",{name:"Atualizar"}).click();await expect(panel.getByRole("alert")).toBeVisible();
  await expect(panel.getByRole("heading",{name:"Sessão de teste",exact:true})).toHaveCount(1);
  expect(await page.evaluate(()=>localStorage.getItem("evoluir.data.v1"))).toBe(before);
});

// The real entry is a cross-origin POST from a new tab; noreferrer made its Origin null.
test("abre pelo botão e preserva Origin no formulário privado",async({page,context})=>{
  const {default:handler}=await import("../../api/learning");
  const target="https://learning-example.onrender.com";
  const original=process.env.LEARNHARNESS_URL;process.env.LEARNHARNESS_URL=target;
  const headers:Record<string,string>={};let html="";
  try { await handler({method:"GET",query:{op:"open"}} as any,{setHeader:(k:string,v:string)=>{headers[k]=v},end:(value:string)=>{html=value}} as any); }
  finally { if(original===undefined)delete process.env.LEARNHARNESS_URL;else process.env.LEARNHARNESS_URL=original; }
  await context.route("**/api/learning?op=open",route=>route.fulfill({headers,body:html}));
  await context.route("**/api/learning?op=ticket",route=>route.fulfill({json:{target,ticket:"a".repeat(43)}}));
  let origin:string|undefined,submitted="";
  await context.route(target+"/prumo/access",route=>{origin=route.request().headers().origin;submitted=route.request().postData()||"";return route.fulfill({contentType:"text/html; charset=utf-8",body:"Sessão privada aberta"});});
  await page.route("**/api/learning",route=>route.fulfill({json:{syncedAt:new Date().toISOString(),sessions:[]}}));
  await page.goto("/");const expectedOrigin=new URL(page.url()).origin;
  await page.getByRole("navigation").getByRole("button",{name:"Estudos",exact:true}).click();
  const popupPromise=context.waitForEvent("page");await page.getByRole("link",{name:/Abrir LearnHarness/}).click();const popup=await popupPromise;
  await expect(popup.getByText("Sessão privada aberta")).toBeVisible();expect(origin).toBe(expectedOrigin);expect(submitted).toBe("ticket="+"a".repeat(43));
});
