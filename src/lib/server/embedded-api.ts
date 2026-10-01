import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

// Keep the separately compiled API and its native Prisma engine out of webpack.
// next.config.ts includes these runtime files in the standalone deployment.
type EmbeddedApi = {
  ready(): Promise<unknown>;
  close(): Promise<void>;
  routing(request: IncomingMessage, response: ServerResponse): void;
  inject(options: {
    method: "POST";
    url: string;
    headers: Record<string, string>;
    payload: string;
  }): Promise<{ statusCode: number; body: string }>;
};

const runtime = globalThis as typeof globalThis & {
  prosisApi?: Promise<EmbeddedApi>;
};

export function getEmbeddedApi(): Promise<EmbeddedApi> {
  if (!runtime.prosisApi) {
    runtime.prosisApi = (async () => {
      const { createRequire } = await import(/* webpackIgnore: true */ "node:module");
      const requireApi = createRequire(path.join(process.cwd(), "package.json"));
      const { createApp } = requireApi("./apps/api/dist/app.js") as {
        createApp(): EmbeddedApi;
      };
      const app = createApp();
      try {
        await app.ready();
        return app;
      } catch (error) {
        await app.close().catch(() => undefined);
        throw error;
      }
    })().catch((error: unknown) => {
      runtime.prosisApi = undefined;
      throw error;
    });
  }
  return runtime.prosisApi;
}

export async function sendLoginToApi(
  body: unknown,
  headers: Record<string, string>,
): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    const app = await getEmbeddedApi();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        app.inject({ method: "POST", url: "/login", headers, payload: JSON.stringify(body) }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new DOMException("Login timeout", "TimeoutError")), 15000);
        }),
      ]);
      return new Response(result.body, {
        status: result.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      clearTimeout(timer);
    }
  }

  const apiPort = process.env.API_PORT?.trim() || "3333";
  const backendUrl = process.env.INTERNAL_API_URL?.trim() || `http://127.0.0.1:${apiPort}`;
  return fetch(`${backendUrl}/login`, {
    method: "POST", headers, body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
}
