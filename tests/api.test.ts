import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import handler from "../api/strava";
import search from "../api/study-search";
import { seal, unseal } from "../server/strava-session";
import type { ApiRequest, ApiResponse } from "../server/http";
const secret = "test-secret-with-at-least-thirty-two-characters";
const token = {
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 10000,
};
function response() {
  const headers: Record<string, unknown> = {};
  const result = {
    statusCode: 200,
    body: undefined as unknown,
    headers,
    redirectTo: "",
    setHeader: vi.fn((key: string, value: unknown) => {
      headers[key] = value;
    }),
    status: vi.fn((code: number) => {
      result.statusCode = code;
      return result;
    }),
    json: vi.fn((body: unknown) => {
      result.body = body;
      return result;
    }),
    redirect: vi.fn((code: number, url: string) => {
      result.statusCode = code;
      result.redirectTo = url;
      return result;
    }),
  };
  return result;
}
function req(
  op: string,
  method = "GET",
  cookie = "",
  origin = "https://example.com",
) {
  return {
    method,
    query: { op },
    headers: { cookie, origin },
  } as unknown as ApiRequest;
}
function configure() {
  vi.stubEnv("STRAVA_CLIENT_ID", "12345");
  vi.stubEnv("STRAVA_CLIENT_SECRET", "test-client-secret");
  vi.stubEnv("STRAVA_SESSION_SECRET", secret);
  vi.stubEnv("APP_ORIGIN", "https://example.com");
}
const session = () =>
  `__Host-evoluir-strava=${seal({ token, until: Date.now() + 1000000 }, secret)}`;
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("fronteira Strava", () => {
  it("sessão criptografada resiste a adulteração e chave diferente", () => {
    const value = seal({ token }, secret);
    expect(value).not.toContain(token.access_token);
    expect(unseal(value, secret)).toEqual({ token });
    expect(() => unseal(value, "outra-chave")).toThrow();
    const raw = Buffer.from(value, "base64url");
    raw[raw.length - 1] ^= 1;
    expect(() => unseal(raw.toString("base64url"), secret)).toThrow();
  });
  it("sem configuração não oferece conexão falsa nem consulta o provedor", async () => {
    vi.stubEnv("STRAVA_CLIENT_ID", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await handler(req("status"), res as unknown as ApiResponse);
    expect(res.body).toEqual({ configured: false, connected: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("recusa sessão adulterada, expirada e consulta anônima", async () => {
    configure();
    for (const cookie of [
      "",
      session() + "x",
      `__Host-evoluir-strava=${seal({ token, until: 1 }, secret)}`,
    ]) {
      const res = response();
      await handler(
        req("activities", "GET", cookie),
        res as unknown as ApiResponse,
      );
      expect(res.statusCode).toBe(401);
    }
  });
  it("OAuth usa state e cookie HttpOnly; callback sem state não troca token", async () => {
    configure();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await handler(req("connect"), res as unknown as ApiResponse);
    expect(res.redirectTo).toContain("https://www.strava.com/oauth/authorize");
    expect(res.headers["Set-Cookie"]).toContain(
      "HttpOnly; Secure; SameSite=Lax",
    );
    expect(new URL(res.redirectTo).searchParams.get("redirect_uri")).toBe(
      "https://example.com/api/strava?op=callback",
    );
    const callback = req("callback");
    callback.query = {
      op: "callback",
      state: "inventado",
      code: "fake-code",
      scope: "activity:read_all",
    };
    const out = response();
    await handler(callback, out as unknown as ApiResponse);
    expect(out.redirectTo).toBe("https://example.com/?strava=error");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("consulta só corridas, não retorna tokens e proíbe cache", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              {
                id: 1,
                name: "Corrida",
                distance: 5000,
                moving_time: 1800,
                elapsed_time: 1900,
                start_date: "2026-11-02T12:00:00Z",
                sport_type: "Run",
              },
              {
                id: 2,
                name: "Pedalada",
                distance: 20000,
                moving_time: 3000,
                elapsed_time: 3100,
                start_date: "2026-11-02T12:00:00Z",
                sport_type: "Ride",
              },
            ]),
            { status: 200 },
          ),
      ),
    );
    const res = response();
    await handler(
      req("activities", "GET", session()),
      res as unknown as ApiResponse,
    );
    expect(res.statusCode).toBe(200);
    expect((res.body as { activities: unknown[] }).activities).toHaveLength(1);
    expect(JSON.stringify(res.body)).not.toContain("token");
    expect(res.headers["Cache-Control"]).toBe("private, no-store");
  });
  it("revogação exige origem confiável", async () => {
    configure();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await handler(
      req("disconnect", "POST", session(), "https://attacker.example"),
      res as unknown as ApiResponse,
    );
    expect(res.statusCode).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
});
describe("busca de referências", () => {
  it("valida a entrada sem chamar um endereço fornecido pelo visitante", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await search(
      { method: "GET", query: { q: "a" } } as unknown as ApiRequest,
      res as unknown as ApiResponse,
    );
    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("preserva documentação oficial quando a API falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    const res = response();
    await search(
      { method: "GET", query: { q: "Spring Cloud" } } as unknown as ApiRequest,
      res as unknown as ApiResponse,
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as { sources: unknown[]; warning: string };
    expect(body.sources.length).toBeGreaterThan(3);
    expect(body.warning).toContain("não respondeu");
  });
  it("usa a API documentada, atribui resultados e ignora links fora do domínio", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                title: "Service discovery",
                link: "https://stackoverflow.com/questions/123/test",
                score: 30,
                is_answered: true,
              },
              {
                title: "Outro",
                link: "https://attacker.example",
                score: 100,
                is_answered: true,
              },
            ],
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await search(
      {
        method: "GET",
        query: { q: "Spring Cloud Eureka" },
      } as unknown as ApiRequest,
      res as unknown as ApiResponse,
    );
    expect(String(fetch.mock.calls[0]?.[0])).toContain(
      "https://api.stackexchange.com/2.3/search/advanced",
    );
    const body = res.body as { sources: { url: string; kind: string }[] };
    expect(body.sources.some((s) => s.kind === "community")).toBe(true);
    expect(body.sources.some((s) => s.url.includes("attacker"))).toBe(false);
  });
});

describe("ciclo OAuth e revogação", () => {
  it("troca código somente com state válido e não revela tokens na resposta", async () => {
    configure();
    const fetch = vi.fn(
      async () => new Response(JSON.stringify(token), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetch);
    const start = response();
    await handler(req("connect"), start as unknown as ApiResponse);
    const state = new URL(start.redirectTo).searchParams.get("state")!;
    const stateCookie = String(start.headers["Set-Cookie"]).split(";")[0];
    const callback = req("callback", "GET", stateCookie);
    callback.query = {
      op: "callback",
      code: "test-code",
      state,
      scope: "read,activity:read_all",
    };
    const out = response();
    await handler(callback, out as unknown as ApiResponse);
    expect(out.redirectTo).toBe("https://example.com/?strava=connected");
    const setCookie = out.headers["Set-Cookie"] as string[];
    expect(setCookie[1]).toContain("HttpOnly; Secure; SameSite=Lax");
    expect(setCookie[1]).not.toContain(token.access_token);
    expect(out.body).toBeUndefined();
  });
  it("renova token expirado apenas no servidor", async () => {
    configure();
    const refreshed = {
      ...token,
      access_token: "new-test-access",
      refresh_token: "new-test-refresh",
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(refreshed), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const old = `__Host-evoluir-strava=${seal({ token: { ...token, expires_at: 1 }, until: Date.now() + 100000 }, secret)}`;
    const out = response();
    await handler(req("activities", "GET", old), out as unknown as ApiResponse);
    expect(out.statusCode).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://www.strava.com/oauth/token");
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer new-test-access",
    );
    expect(JSON.stringify(out.body)).not.toContain("new-test");
  });
  it("revoga a autorização e apaga o cookie de sessão", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    const out = response();
    await handler(
      req("disconnect", "POST", session()),
      out as unknown as ApiResponse,
    );
    expect(out.body).toEqual({ disconnected: true });
    expect(out.headers["Set-Cookie"]).toContain("Max-Age=0");
  });
  it("respeita limite de consultas sem revelar dados de sessão", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 429 })),
    );
    const out = response();
    await handler(
      req("activities", "GET", session()),
      out as unknown as ApiResponse,
    );
    expect(out.statusCode).toBe(429);
    expect(JSON.stringify(out.body)).not.toContain(token.access_token);
  });
});
