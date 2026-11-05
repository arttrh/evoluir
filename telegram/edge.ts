// O gateway mantém a credencial privilegiada do banco dentro do Supabase.
Deno.serve(async (request: Request) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "private, no-store" };
  if (request.method !== "POST") return new Response("{}", { status: 405, headers });
  const supplied = request.headers.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!supplied) return new Response("{}", { status: 401, headers });
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      for (;;) {
        const next = await reader.read(); if (next.done) break;
        size += next.value.byteLength;
        if (size > 4_000_000) throw new Error();
        chunks.push(next.value);
      }
    } finally { await reader.cancel(); reader.releaseLock(); }
    const raw = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { raw.set(chunk, offset); offset += chunk.byteLength; }
    const command = JSON.parse(new TextDecoder().decode(raw));
    const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(supplied)))].map(b => b.toString(16).padStart(2, "0")).join("");
    const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
    const secret = modern ? JSON.parse(modern).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secret) throw new Error();
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/prumo_telegram_store`, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { apikey: secret, ...(secret.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${secret}` }), "Content-Type": "application/json" },
      body: JSON.stringify({ p_digest: digest, p_command: command }),
    });
    if (!response.ok) return new Response("{}", { status: response.status === 403 ? 403 : 409, headers });
    return new Response(await response.text(), { headers });
  } catch { return new Response("{}", { status: 503, headers }); }
});
