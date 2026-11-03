import { afterEach, expect, it, vi } from "vitest";
import handler from "../api/learning";
import type { ApiRequest, ApiResponse } from "../server/http";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function setup(method = "GET", body?: unknown) {
  vi.stubEnv("JAVA_BACKEND_URL", "https://java.example.test");
  vi.stubEnv("JAVA_BACKEND_KEY", "private-example-key-for-server-tests");
  const req = { method, query: {}, body, headers: { origin: "https://evoluir-hazel.vercel.app", "content-type": "application/json", cookie: "private-user-cookie" } } as unknown as ApiRequest;
  const res = {setHeader:vi.fn(),status:vi.fn().mockReturnThis(),json:vi.fn().mockReturnThis(),end:vi.fn()} as unknown as ApiResponse;
  return {req,res};
}
it("consulta o Java com chave privada sem encaminhar cookies do navegador", async () => {
  const {req,res}=setup(); const fetch=vi.fn().mockResolvedValue(new Response('{"sessions":[]}'));vi.stubGlobal("fetch",fetch);
  await handler(req,res);
  expect(fetch.mock.calls[0][0].pathname).toBe("/api/study-sessions");
  expect(fetch.mock.calls[0][1].headers.Cookie).toBeUndefined();
  expect(fetch.mock.calls[0][1].headers["X-Prumo-Backend-Key"]).toBe(process.env.JAVA_BACKEND_KEY);
  expect(res.end).toHaveBeenCalledWith('{"sessions":[]}');
  expect(res.setHeader).toHaveBeenCalledWith("Cache-Control","private, no-store");
});
it("recusa vínculo inválido e origem externa antes de acessar o backend",async()=>{
  const {req,res}=setup("POST",{sessionId:"session",trackId:"track",topicId:"topic",done:true});
  const fetch=vi.fn();vi.stubGlobal("fetch",fetch);await handler(req,res);
  expect(res.status).toHaveBeenCalledWith(400);expect(fetch).not.toHaveBeenCalled();
  req.headers.origin="https://outside.test";await handler(req,res);expect(res.status).toHaveBeenCalledWith(403);expect(fetch).not.toHaveBeenCalled();
});
it("vincula IDs sem modificar conclusões ou inventar tempo",async()=>{
  const link={sessionId:"session",trackId:"track",topicId:"topic"};const {req,res}=setup("POST",link);
  const fetch=vi.fn().mockResolvedValue(Response.json({saved:true}));vi.stubGlobal("fetch",fetch);await handler(req,res);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(link);expect(res.status).toHaveBeenCalledWith(200);
});
it("falha de comunicação não expõe credenciais",async()=>{
  const {req,res}=setup();vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error(process.env.JAVA_BACKEND_KEY)));await handler(req,res);
  expect(res.status).toHaveBeenCalledWith(503);expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain(process.env.JAVA_BACKEND_KEY);
});
it("abre somente com bilhete temporário; chaves privadas não entram no formulário",async()=>{
  const {req,res}=setup();req.query.op="open";
  vi.stubEnv("LEARNHARNESS_URL","https://learning-example.onrender.com");
  vi.stubEnv("PRUMO_STORE_URL","https://atzncofgyitahiguuhcn.supabase.co/functions/v1/prumo-lh-store");
  vi.stubEnv("PRUMO_GATEWAY_KEY","private-gateway-for-tests-".repeat(3));
  const fetch=vi.fn().mockResolvedValueOnce(Response.json({sessions:[]})).mockResolvedValueOnce(Response.json({ok:true}));vi.stubGlobal("fetch",fetch);
  await handler(req,res);
  const html=String(vi.mocked(res.end).mock.calls[0]?.[0]);
  expect(html).toContain('action="https://learning-example.onrender.com/prumo/access"');
  expect(html).toMatch(/name="ticket" value="[A-Za-z0-9_-]{43}"/);
  expect(html).not.toContain(process.env.PRUMO_GATEWAY_KEY);expect(html).not.toContain(process.env.JAVA_BACKEND_KEY);
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${process.env.PRUMO_GATEWAY_KEY}`);
});
