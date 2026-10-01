import type { NextApiRequest, NextApiResponse } from "next";
import { getEmbeddedApi } from "@/lib/server/embedded-api";

export const config = {
  api: { bodyParser: false, externalResolver: true, responseLimit: false },
};

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const app = await getEmbeddedApi();
    // Preserve the raw body, cookies, method, escaped path and query string.
    const url = request.url ?? "/api/proxy";
    const suffix = url.replace(/^\/api\/proxy(?=\/|\?|$)/, "");
    request.url = !suffix || suffix.startsWith("?") ? `/${suffix}` : suffix;
    response.setHeader("Cache-Control", "no-store");
    app.routing(request, response);
  } catch (error) {
    const failure = error as { code?: string; name?: string };
    console.error("[api] Falha ao preparar API integrada", {
      code: failure?.code ?? failure?.name ?? "UNKNOWN",
    });
    if (!response.headersSent) {
      response.setHeader("Cache-Control", "no-store");
      response.status(503).json({ message: "API indisponível. Verifique a configuração do servidor." });
    } else {
      response.end();
    }
  }
}
