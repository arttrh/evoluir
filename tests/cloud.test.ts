import { afterEach, expect, it, vi } from "vitest";
import { fetchCloud } from "../src/cloud";
import { parseDecimal } from "../src/model";
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it("aceita vírgula ou ponto sem perder metros e recusa entradas ambíguas", () => {
  for (const [raw, value] of [["4,1",4.1],["4.2",4.2],["4,125",4.125],[" 0,2 ",0.2]] as const) expect(parseDecimal(raw)).toBe(value);
  for (const raw of ["", "4,1.2", "4 km", "-4", "1e3", "4,", "1.000,2"]) expect(() => parseDecimal(raw)).toThrow();
});
it("repete apenas indisponibilidade transitória até o serviço acordar", async () => {
  vi.useFakeTimers(); const fetch=vi.fn().mockResolvedValueOnce(new Response("",{status:503})).mockResolvedValueOnce(Response.json({ok:true}));vi.stubGlobal("fetch",fetch);
  const pending=fetchCloud("/api/news"); await vi.runAllTimersAsync();expect((await pending).ok).toBe(true);expect(fetch).toHaveBeenCalledTimes(2);
});
it("não repete falha de autorização nem requisição já cancelada",async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response("",{status:401}));vi.stubGlobal("fetch",fetch);expect((await fetchCloud("/api/learning")).status).toBe(401);expect(fetch).toHaveBeenCalledTimes(1);
  const controller=new AbortController();controller.abort();await expect(fetchCloud("/api/learning",controller.signal)).rejects.toThrow();expect(fetch).toHaveBeenCalledTimes(1);
});
