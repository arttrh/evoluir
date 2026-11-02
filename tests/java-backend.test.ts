import { afterEach, expect, it, vi } from "vitest";
import { forwardToJava } from "../server/java-backend";
import type { ApiRequest, ApiResponse } from "../server/http";
const key = "test-backend-key-for-contract-tests-only";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function setup(query: ApiRequest["query"] = {}) {
  vi.stubEnv("JAVA_BACKEND_URL", "https://java.example.test");
  vi.stubEnv("JAVA_BACKEND_KEY", key);
  const req = {method: "GET", query, headers: {cookie: "private=session", origin: "https://evoluir-hazel.vercel.app", authorization: "Bearer browser-token"}} as unknown as ApiRequest;
  const res = {setHeader: vi.fn(),status: vi.fn().mockReturnThis(),json: vi.fn().mockReturnThis(),end: vi.fn()} as unknown as ApiResponse;
  return {req,res};
}
it("não troca o backend enquanto a hospedagem Java não foi configurada", async () => {
  const {req,res}=setup(); vi.stubEnv("JAVA_BACKEND_URL", ""); const fetch=vi.fn();vi.stubGlobal("fetch",fetch);
  expect(await forwardToJava(req,res,"/api/jobs")).toBe(false);expect(fetch).not.toHaveBeenCalled();
});
it("encaminha filtros e chave apenas servidor a servidor, sem credenciais do navegador",async()=>{
  const {req,res}=setup({q:"Java",source:["Todas","Backend BR"]});
  const fetch=vi.fn().mockResolvedValue(new Response('{"items":[]}'));vi.stubGlobal("fetch",fetch);
  expect(await forwardToJava(req,res,"/api/jobs")).toBe(true);
  const [url,options]=fetch.mock.calls[0];expect(url.origin).toBe("https://java.example.test");expect(url.pathname).toBe("/api/jobs");expect(url.searchParams.getAll("source")).toEqual(["Todas","Backend BR"]);
  expect(options.headers).toEqual({"X-Prumo-Backend-Key":key,Accept:"application/json"});expect(options.redirect).toBe("manual");
  expect(res.end).toHaveBeenCalledWith('{"items":[]}');expect(res.setHeader).toHaveBeenCalledWith("Cache-Control","private, no-store");
});
it("preserva os dois cookies seguros e o redirecionamento OAuth sem seguir o Strava",async()=>{
  const {req,res}=setup({op:"callback"}); const headers=new Headers({Location:"https://evoluir-hazel.vercel.app/?strava=connected"});headers.append("Set-Cookie","__Host-evoluir-oauth=; Secure; HttpOnly; Path=/");headers.append("Set-Cookie","__Host-evoluir-strava=test; Secure; HttpOnly; Path=/");
  const fetch=vi.fn().mockResolvedValue(new Response(null,{status:303,headers}));vi.stubGlobal("fetch",fetch);
  await forwardToJava(req,res,"/api/strava");expect(fetch.mock.calls[0][1].headers.Cookie).toBe("private=session");expect(fetch.mock.calls[0][1].headers.Origin).toBe(req.headers.origin);
  expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie",expect.arrayContaining([expect.stringContaining("__Host-evoluir-oauth="),expect.stringContaining("__Host-evoluir-strava=")]));expect(res.status).toHaveBeenCalledWith(303);
  expect(res.setHeader).toHaveBeenCalledWith("Location","https://evoluir-hazel.vercel.app/?strava=connected");expect(res.end).toHaveBeenCalledWith("");
});
it.each(["http://evil.test","https://user:password@java.example.test","https://java.example.test/path","https://java.example.test?q=token"])("recusa origem insegura %s e falha fechada",async url=>{
  const {req,res}=setup();vi.stubEnv("JAVA_BACKEND_URL",url);const fetch=vi.fn();vi.stubGlobal("fetch",fetch);
  expect(await forwardToJava(req,res,"/api/news")).toBe(true);expect(res.status).toHaveBeenCalledWith(503);expect(fetch).not.toHaveBeenCalled();
});
it("não expõe a chave nem recorre ao backend anterior em falha ou resposta excessiva",async()=>{
  const {req,res}=setup();vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response("x".repeat(2_000_001))));
  expect(await forwardToJava(req,res,"/api/jobs")).toBe(true);expect(res.status).toHaveBeenCalledWith(503);expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain(key);
});
it("recusa localhost em produção e exige uma chave forte",async()=>{
  const {req,res}=setup();vi.stubEnv("JAVA_BACKEND_URL","http://127.0.0.1:8080");vi.stubEnv("VERCEL","1");vi.stubGlobal("fetch",vi.fn());await forwardToJava(req,res,"/api/jobs");expect(res.status).toHaveBeenCalledWith(503);
  vi.stubEnv("JAVA_BACKEND_URL","https://java.example.test");vi.stubEnv("JAVA_BACKEND_KEY","short");await forwardToJava(req,res,"/api/jobs");expect(fetch).not.toHaveBeenCalled();
});
