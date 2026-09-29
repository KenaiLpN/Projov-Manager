import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { checkApiHealth } from "../scripts/api-healthcheck.mjs";

async function withServer(handler, run) {
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try { await run(server.address().port); }
  finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("healthcheck funciona mesmo com fetch global alterado pelo framework", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("fetch indisponivel"); };
  try {
    await withServer((req, res) => {
      assert.equal(req.url, "/health");
      res.end('{"status":"API Online"}');
    }, async (port) => assert.deepEqual(await checkApiHealth(port), { ok: true }));
  } finally { globalThis.fetch = original; }
});

for (const [status, body, reason] of [
  [403, '{"message":"segredo que nao deve ir para o log"}', "HTTP_403"],
  [503, "indisponivel", "HTTP_503"],
  [302, "", "HTTP_302"],
  [200, "<html>outra aplicacao</html>", "INVALID_JSON"],
  [200, '{"status":"outra API"}', "UNEXPECTED_PAYLOAD"],
  [200, "null", "UNEXPECTED_PAYLOAD"],
  [200, "x".repeat(17000), "RESPONSE_TOO_LARGE"],
]) {
  test(`rejeita resposta ${reason} sem expor seu corpo`, async () => {
    await withServer((_req, res) => {
      res.writeHead(status);
      res.end(body);
    }, async (port) => assert.deepEqual(await checkApiHealth(port), { ok: false, reason }));
  });
}

test("timeout abrange corpo incompleto, mesmo depois de receber cabecalhos", async () => {
  await withServer((_req, res) => {
    res.writeHead(200);
    res.write('{"status":');
  }, async (port) => {
    assert.deepEqual(await checkApiHealth(port, 100), { ok: false, reason: "TIMEOUT" });
  });
});

test("distingue conexao recusada de API nao saudavel", async () => {
  let closedPort;
  await withServer((_req, res) => res.end(), async (port) => { closedPort = port; });
  assert.deepEqual(await checkApiHealth(closedPort), { ok: false, reason: "ECONNREFUSED" });
});
