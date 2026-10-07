import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const apiRequire = createRequire(`${process.cwd()}/apps/api/package.json`);
const { fastify } = apiRequire("fastify");
const { validatorCompiler, serializerCompiler } = apiRequire("fastify-type-provider-zod");

// The real Prisma client is never constructed: every unmocked operation fails closed.
process.env.DATABASE_URL = "mysql://security_test:dummy@127.0.0.1:1/no_database";
const unexpected: string[] = [];
const fakePrisma: Record<string, any> = new Proxy({}, {
  get(target: Record<string, any>, model: string) {
    if (!(model in target)) target[model] = model.startsWith("$")
      ? async () => { unexpected.push(model); throw new Error("Unexpected database operation in test"); }
      : new Proxy({}, {
          get(delegate: Record<string, any>, operation: string) {
            return delegate[operation] ??= async () => {
              unexpected.push(`${model}.${operation}`);
              throw new Error("Unexpected database operation in test");
            };
          },
        });
    return target[model];
  },
});
(globalThis as any).prisma = fakePrisma;
// Perfis personalizados são opcionais durante a migração. Esta suíte exercita
// o fallback das funções existentes sem consultar um banco real.
fakePrisma.accessUserProfile.findUnique = async () => null;

let modules: any;
test.before(async () => {
  const [educadores, chamados, aprendizes, users, empresa, planos, curricular, alocacoes, caps, faltas, service, nextId, schemas] = await Promise.all([
    import("../apps/api/src/routes/educador.routes"),
    import("../apps/api/src/routes/chamado.routes"),
    import("../apps/api/src/routes/CA_Aprendiz.routes"),
    import("../apps/api/src/routes/user.routes"),
    import("../apps/api/src/routes/empresaAprendiz.routes"),
    import("../apps/api/src/routes/plano.routes"),
    import("../apps/api/src/routes/planoCurricular.routes"),
    import("../apps/api/src/routes/alocacao.routes"),
    import("../apps/api/src/routes/CA_Capacitacao.routes"),
    import("../apps/api/src/routes/faltasCapacitacao.routes"),
    import("../apps/api/src/services/CA_AprendizService"),
    import("../apps/api/src/lib/nextId"),
    import("../apps/api/src/schemas/pedagogyWriteSchema"),
  ]);
  modules = { educadores, chamados, aprendizes, users, empresa, planos, curricular, alocacoes, caps, faltas, service, nextId, schemas };
});

test.afterEach(() => {
  assert.deepEqual(unexpected.splice(0), [], "No unexpected database operation is permitted");
});

function dbMock(t: any, delegate: any, method: string, implementation: any) {
  void delegate[method];
  return t.mock.method(delegate, method, implementation);
}

async function appFor(t: any, plugin: any, role = "A", sub = "17") {
  const app = fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async () => {});
  app.addHook("onRequest", async (request: any) => {
    // This fixture isolates authorization after successful authentication.
    request.user = { role, sub, tipoAcesso: ["APRENDIZ", "EMPRESA", "EDUCADOR"].includes(role) ? role : "USUARIO" };
  });
  app.register(plugin);
  await app.ready();
  t.after(() => app.close());
  return app;
}

test("EDUCADOR cannot read/update other profiles or create/delete educators", async (t) => {
  const app = await appFor(t, modules.educadores.educadorRoutes, "EDUCADOR");
  for (const [method, url, payload, status] of [
    ["GET", "/educadores/18", undefined, 404],
    ["PUT", "/educadores/18", { EducNome: "Attempt" }, 404],
    ["GET", "/educadores", undefined, 403],
    ["POST", "/educadores", { EducNome: "Attempt" }, 403],
    ["DELETE", "/educadores/17", undefined, 403],
    ["DELETE", "/educadores/18", undefined, 403],
  ]) {
    const result = await app.inject({ method, url, payload });
    assert.equal(result.statusCode, status, `${method} ${url}`);
  }
});

test("EDUCADOR self-update strips privileges and passwords and never returns a password hash", async (t) => {
  let written: any;
  dbMock(t, fakePrisma.cA_Educadores, "update", async (query: any) => {
    written = query;
    return { EducCodigo: 17, EducNome: query.data.EducNome, EducSenha: "SYNTHETIC_HASH_MUST_NOT_LEAK" };
  });
  const app = await appFor(t, modules.educadores.educadorRoutes, "EDUCADOR");
  const result = await app.inject({ method: "PUT", url: "/educadores/17", payload: {
    EducNome: "Meu nome", EducSituacao: "A", EducTipo: "A", EducSenha: "attacker-password", EducCodigo: 18,
  } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(written, { where: { EducCodigo: 17 }, data: { EducNome: "Meu nome" } });
  assert.equal(result.body.includes("SYNTHETIC_HASH_MUST_NOT_LEAK"), false);
  assert.equal(Object.hasOwn(result.json(), "EducSenha"), false);
});

test("Educator create also excludes credential fields from the response", async (t) => {
  dbMock(t, fakePrisma.cA_Educadores, "create", async () => ({ EducCodigo: 20, EducSenha: "SYNTHETIC_HASH" }));
  const app = await appFor(t, modules.educadores.educadorRoutes);
  const result = await app.inject({ method: "POST", url: "/educadores", payload: { EducNome: "Teste" } });
  assert.equal(result.statusCode, 201);
  assert.equal(Object.hasOwn(result.json(), "EducSenha"), false);
});

test("APRENDIZ cannot access or modify another record", async (t) => {
  const app = await appFor(t, modules.aprendizes.caAprendizRoutes, "APRENDIZ");
  for (const method of ["GET", "PUT", "DELETE"]) {
    const result = await app.inject({ method, url: "/ca-aprendiz/18", ...(method === "PUT" ? { payload: {} } : {}) });
    assert.equal(result.statusCode, 403);
  }
});

test("APRENDIZ self-update strips administrative fields and uses authenticated identity", async (t) => {
  let written: any;
  t.mock.method(modules.service.CA_AprendizService.prototype, "update", async (...args: any[]) => {
    written = args;
    return { Apr_Codigo: 17 };
  });
  const app = await appFor(t, modules.aprendizes.caAprendizRoutes, "APRENDIZ");
  const result = await app.inject({ method: "PUT", url: "/ca-aprendiz/17", payload: {
    Apr_NomeSocial: "Nome social", Apr_Situacao: 6, Apr_Codigo: 18, Apr_UsuarioCadastro: "admin", is_admin: true,
  } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(written, [17, { Apr_NomeSocial: "Nome social" }, "17"]);
});

test("User administration denies non-admin internal roles before querying data", async (t) => {
  for (const role of ["C", "P", "T", "E", "S"]) {
    const app = await appFor(t, modules.users.userRoutes, role);
    assert.equal((await app.inject({ method: "GET", url: "/users" })).statusCode, 403);
    assert.equal((await app.inject({ method: "DELETE", url: "/users/18" })).statusCode, 403);
  }
});

test("Ticket module denies C/E/S despite valid internal sessions", async (t) => {
  for (const role of ["C", "E", "S"]) {
    const app = await appFor(t, modules.chamados.chamadoRoutes, role);
    assert.equal((await app.inject({ method: "GET", url: "/chamados" })).statusCode, 403);
    assert.equal((await app.inject({ method: "POST", url: "/chamados", payload: { departamento: "Projetos", descricao: "Teste de acesso indevido" } })).statusCode, 403);
  }
});

test("Ticket IDOR: requests for another owner's conversation and update produce 404", async (t) => {
  const queries: any[] = [];
  dbMock(t, fakePrisma.chamadoTicket, "findFirst", async (query: any) => { queries.push(query); return null; });
  const app = await appFor(t, modules.chamados.chamadoRoutes, "P");
  for (const [method, url, payload] of [
    ["GET", "/chamados/18/conversa", undefined],
    ["PATCH", "/chamados/18", { departamento: "Projetos", descricao: "Tentativa de alteração" }],
    ["POST", "/chamados/18/mensagens", { mensagem: "Teste" }],
  ]) {
    assert.equal((await app.inject({ method, url, payload })).statusCode, 404);
  }
  assert.equal(queries.length, 3);
  for (const query of queries) assert.deepEqual(query.where, { id: BigInt(18), deletado_em: null, solicitante_id: "17" });
});

test("Ticket technical actions deny requesters; owners cannot promote themselves through payloads", async (t) => {
  const app = await appFor(t, modules.chamados.chamadoRoutes, "A");
  assert.equal((await app.inject({ method: "PATCH", url: "/chamados/18/urgencia", payload: { urgencia: "maxima", role: "DEV" } })).statusCode, 403);
  assert.equal((await app.inject({ method: "POST", url: "/chamados/18/resolver", payload: { role: "T" } })).statusCode, 403);
});

test("Company apprentice details are scoped to authenticated partner units before reading personal data", async (t) => {
  dbMock(t, fakePrisma.cA_ParceirosUnidade, "findMany", async (query: any) => {
    assert.deepEqual(query.where, { ParUniCodigoParceiro: 17 });
    return [{ ParUniCodigo: 71, ParUniDescricao: "Unidade de teste" }];
  });
  dbMock(t, fakePrisma.cA_AlocacaoAprendiz, "findMany", async (query: any) => {
    assert.deepEqual(query.where, { ALAUnidadeParceiro: { in: [71] }, ALAAprendiz: 18 });
    return [];
  });
  const app = await appFor(t, modules.empresa.empresaAprendizRoutes, "EMPRESA");
  for (const endpoint of ["detalhes", "calendario"]) {
    const result = await app.inject({ method: "GET", url: `/empresa/aprendizes-alocados/18/${endpoint}?partnerId=99` });
    assert.equal(result.statusCode, 404);
  }
});

test("Plan and curriculum allowlists prevent changing primary keys through update bodies", async (t) => {
  dbMock(t, fakePrisma.cA_Planos, "update", async (query: any) => {
    assert.deepEqual(query, { where: { PlanCodigo: 17 }, data: { PlanDescricao: "Atualizado" } });
    return { PlanCodigo: 17 };
  });
  dbMock(t, fakePrisma.cA_PlanoCurricular, "update", async (query: any) => {
    assert.deepEqual(query, { where: { PlcCodigoPlano_PlcDisciplina: { PlcCodigoPlano: 17, PlcDisciplina: 2 } }, data: { PlcDescricao: "Atualizado" } });
    return { PlcCodigoPlano: 17, PlcDisciplina: 2 };
  });
  const app = await appFor(t, modules.planos.planoRoutes);
  const curricular = await appFor(t, modules.curricular.planoCurricularRoutes);
  assert.equal((await app.inject({ method: "PUT", url: "/planos/17", payload: { PlanCodigo: 99, PlanDescricao: "Atualizado" } })).statusCode, 200);
  assert.equal((await curricular.inject({ method: "PUT", url: "/plano-curricular/17/2", payload: { PlcCodigoPlano: 99, PlcDisciplina: 99, PlcDescricao: "Atualizado" } })).statusCode, 200);
});

test("Malformed dates, IDs and oversized attendance batches fail validation before data access", async (t) => {
  const caps = await appFor(t, modules.caps.capacitacaoRoutes);
  assert.equal((await caps.inject({ method: "POST", url: "/ca-aprendiz/17/capacitacoes", payload: { CapTurma: 1, CapUnidade: 1, CapDataInicio: "2026-02-31" } })).statusCode, 400);
  assert.equal((await caps.inject({ method: "DELETE", url: "/ca-aprendiz/capacitacoes/-1" })).statusCode, 400);
  const faltas = await appFor(t, modules.faltas.faltasCapacitacaoRoutes);
  assert.equal((await faltas.inject({ method: "POST", url: "/faltas-capacitacao/presencas", payload: { registros: Array.from({ length: 1001 }, () => ({ aprendiz: 17, turma: 1, data: "2026-10-01", presenca: "P" })) } })).statusCode, 400);
});

test("Allocation and attendance allowlists discard forged owner/audit columns", () => {
  const parsed = modules.schemas.createAlocacaoBodySchema.parse({ ALATurma: 1, ALAUnidadeParceiro: 2, ALAAprendiz: 999, ALAUsuarioCadastro: "admin", ALAOrdem: 9 });
  assert.deepEqual(parsed, { ALATurma: 1, ALAUnidadeParceiro: 2 });
  const attendance = modules.schemas.capacitacaoPresencasBodySchema.parse({ registros: [{ aprendiz: 17, turma: 2, data: "2026-10-01", presenca: "P", usuario: "admin" }] });
  assert.equal(Object.hasOwn(attendance.registros[0], "usuario"), false);
});

test("Unbounded and malformed pagination requests are rejected before database access", async (t) => {
  for (const [plugin, endpoint] of [[modules.aprendizes.caAprendizRoutes, "/ca-aprendiz"], [modules.planos.planoRoutes, "/planos"], [modules.curricular.planoCurricularRoutes, "/plano-curricular"]]) {
    const app = await appFor(t, plugin);
    for (const query of ["limit=100000000", "limit=-1", "limit=1.5", "page=-1"]) {
      assert.equal((await app.inject({ method: "GET", url: `${endpoint}?${query}` })).statusCode, 400);
    }
  }
});

test("Raw SQL identifier injection is rejected by the closed next-ID allowlist", async () => {
  for (const [table, column] of [["CA_Aprendiz; DROP TABLE users", "Apr_Codigo"], ["CA_Aprendiz", "Apr_Codigo) UNION SELECT 1 --"]]) {
    await assert.rejects(modules.nextId.createWithNextId(table, column, async () => undefined), /Destino de ID nao permitido/);
  }
});

test("Database errors in apprentice writes are replaced by a generic response", async (t) => {
  t.mock.method(modules.service.CA_AprendizService.prototype, "update", async () => { throw new Error("SYNTHETIC_DATABASE_SECRET SQL connection string"); });
  const app = await appFor(t, modules.aprendizes.caAprendizRoutes);
  const result = await app.inject({ method: "PUT", url: "/ca-aprendiz/17", payload: {} });
  assert.equal(result.statusCode, 500);
  assert.equal(result.body.includes("SYNTHETIC_DATABASE_SECRET"), false);
  assert.deepEqual(result.json(), { message: "Erro ao atualizar aprendiz." });
});
