import { afterEach, expect, it, vi } from "vitest";
import { gupyAccountUrl, openGupySession, sealGupySession, verifyGupySession } from "../server/gupy-session";

const key = "a".repeat(64);
const credentials = { authorization: "Bearer fake-session", cookie: "session=fake", userAgent: "Test browser" };
afterEach(() => vi.unstubAllGlobals());
it("cifra a sessão e rejeita alteração do conteúdo ou da chave", () => {
  const sealed = sealGupySession(credentials, key);
  expect(JSON.stringify(sealed)).not.toContain(credentials.authorization);
  expect(openGupySession(sealed, key)).toEqual(credentials);
  expect(() => openGupySession({ ...sealed, tag: "0".repeat(32) }, key)).toThrow();
  expect(() => openGupySession(sealed, "b".repeat(64))).toThrow();
});
it("não aceita sessão vazia, cabeçalhos com quebra de linha ou destino externo", () => {
  expect(() => sealGupySession({}, key)).toThrow();
  expect(() => sealGupySession({ cookie: "session=abc\r\nX-Injected: x" }, key)).toThrow();
  expect(() => sealGupySession({ ...credentials, url: "https://example.com" }, key)).toThrow();
});
it("verifica somente o endpoint de conta da Gupy, sem seguir redirecionamentos", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ id: 123 })); vi.stubGlobal("fetch", fetch);
  expect(await verifyGupySession(sealGupySession(credentials, key), key)).toBe(true);
  expect(fetch).toHaveBeenCalledWith(gupyAccountUrl, expect.objectContaining({ redirect: "error", headers: expect.objectContaining({ Authorization: credentials.authorization, Cookie: credentials.cookie }) }));
});
it("sessão expirada não é declarada como conectada e falhas da plataforma não viram sucesso", async () => {
  const sealed = sealGupySession(credentials, key);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));
  expect(await verifyGupySession(sealed, key)).toBe(false);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>login</html>", { headers: { "Content-Type": "text/html" } })));
  await expect(verifyGupySession(sealed, key)).rejects.toThrow();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "invalid-session" })));
  await expect(verifyGupySession(sealed, key)).rejects.toThrow();
});
