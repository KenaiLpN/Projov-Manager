import { get } from "node:http";

// O supervisor nao depende do fetch global, que pode ser alterado pelo Next.
// Nao segue redirects e nao registra corpos de resposta ou mensagens arbitrarias.
export function checkApiHealth(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(result);
    };
    const request = get({
      hostname: "127.0.0.1", port, path: "/health", agent: false,
      headers: { Accept: "application/json" },
    }, (response) => {
      const status = response.statusCode;
      if (status !== 200) {
        finish({ ok: false, reason: `HTTP_${status}` });
        response.destroy();
        return;
      }
      let size = 0;
      const chunks = [];
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size > 16384) {
          finish({ ok: false, reason: "RESPONSE_TOO_LARGE" });
          response.destroy();
        } else {
          chunks.push(chunk);
        }
      });
      response.on("error", () => finish({ ok: false, reason: "RESPONSE_INTERRUPTED" }));
      response.on("end", () => {
        try {
          const health = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          finish(health?.status === "API Online"
            ? { ok: true }
            : { ok: false, reason: "UNEXPECTED_PAYLOAD" });
        } catch {
          finish({ ok: false, reason: "INVALID_JSON" });
        }
      });
    });
    // Limite total inclui conexao, cabecalhos e leitura do corpo.
    const timer = setTimeout(() => {
      finish({ ok: false, reason: "TIMEOUT" });
      request.destroy();
    }, timeoutMs);
    request.on("error", (error) => {
      const allowed = new Set(["ECONNREFUSED", "ECONNRESET", "EACCES", "EPERM", "ETIMEDOUT", "EHOSTUNREACH", "ENETUNREACH"]);
      finish({ ok: false, reason: allowed.has(error.code) ? error.code : "CONNECTION_ERROR" });
    });
  });
}
