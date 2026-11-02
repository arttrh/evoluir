import type { IncomingMessage, ServerResponse } from "node:http";
// A plataforma acrescenta estes métodos ao ServerResponse do Node.
export type ApiRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>;
};
export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
  redirect(code: number, url: string): ApiResponse;
};

export async function readBounded(response: Response, maximum = 2_000_000) {
  if (Number(response.headers.get("content-length")) > maximum)
    throw new Error("Feed muito grande.");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Feed vazio.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) throw new Error("Feed muito grande.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const part of chunks) {
    body.set(part, offset);
    offset += part.length;
  }
  return new TextDecoder().decode(body);
}
