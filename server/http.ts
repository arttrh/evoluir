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
