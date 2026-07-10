import { fastify, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import cookie from "@fastify/cookie";
import { userRoutes } from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import { unityRoutes } from "./routes/unity.routes";
import { instituicaoRoutes } from "./routes/instituicao.routes";
import { situacaoParticipanteRoutes } from "./routes/situacaoParticipante.routes";
import { occurrenceRoutes } from "./routes/ocorrencias.routes";
import { occurrenceTypeRoutes } from "./routes/occurrenceType.routes";
import { profissaoRoutes } from "./routes/profissao.routes";
import { grauParentescoRoutes } from "./routes/grauParentesco.routes";
import { grauEscolaridadeRoutes } from "./routes/grauEscolaridade.routes";
import { feriadoRoutes } from "./routes/feriado.routes";
import { motivoDesligamentoRoutes } from "./routes/motivoDesligamento.routes";
import { instituicoesParceirasRoutes } from "./routes/instituicoesParceiras.routes";
import { statusEncaminhamentoRoutes } from "./routes/statusEncaminhamento.routes";
import { cadastroRegiaoRoutes } from "./routes/cadastroRegiao.routes";
import { aprendizRoutes } from "./routes/aprendiz.routes";
import { orientadorRoutes } from "./routes/orientador.routes";
import { cadastroRamoAtividadeRoutes } from "./routes/cadastroRamoAtividade.routes";
import { parceiroRoutes } from "./routes/parceiro.routes";
import { unidadeParceiroRoutes } from "./routes/unidadeParceiro.routes";
import { cursoRoutes } from "./routes/curso.routes";
import { disciplinaRoutes } from "./routes/disciplina.routes";
import { turmaRoutes } from "./routes/turma.routes";
import { conceitoRoutes } from "./routes/conceito.routes";
import { areaAtuacaoRoutes } from "./routes/areaAtuacao.routes";
import { vagaRoutes } from "./routes/vaga.routes";
import { funcaoSistemaRoutes } from "./routes/funcaoSistema.routes";
import { relatorioRoutes } from "./routes/relatorio.routes";
import { attendanceRoutes } from "./routes/attendance.routes";
import { planoRoutes } from "./routes/plano.routes";
import { planoCurricularRoutes } from "./routes/planoCurricular.routes";
import { educadorRoutes } from "./routes/educador.routes";
import { presencaRoutes } from "./routes/presenca.routes";
import { caAprendizRoutes } from "./routes/CA_Aprendiz.routes";
import { escolaRoutes } from "./routes/escola.routes";
import { municipioRoutes } from "./routes/municipio.routes";
import { rascunhoAprendizRoutes } from "./routes/rascunho.routes";
import { alocacaoRoutes } from "./routes/alocacao.routes";
import { capacitacaoRoutes } from "./routes/CA_Capacitacao.routes";
import { faltasCapacitacaoRoutes } from "./routes/faltasCapacitacao.routes";
import { registroGIRoutes } from "./routes/registroGI.routes";
import { cronogramaRoutes } from "./routes/cronograma.routes";
import { geracaoCronogramaRoutes } from "./routes/geracaoCronograma.routes";
import { geracaoCronogramaSemestreRoutes } from "./routes/geracaoCronogramaSemestre.routes";
import { empresaAprendizRoutes } from "./routes/empresaAprendiz.routes";
import { participantessituacaoroutes,
        ativos_por_turma_routes,
        ativos_area_atuacao_routes,
        desligados_por_periodo_routes,
        desligados_por_motivo_routes,
        alocacao_no_periodo_routes,
        ativos_por_unidade_routes,
        tipo_de_pagamento_routes,
        conheceu_projov_routes,
        ativos_por_cidade_routes,
        
 } from "./routes/participantessituacao.routes";
 import { estatistica_aprendiz_por_parceiro_routes } from "./routes/estatistica_aprendiz_por_parceiro.routes"; 
 import { estatistica_gestao_avaliacoes_routes ,
          estatistica_avaliacoes_pendentes_routes,
          estatistica_avaliacoes_realizadas_routes,
          estatistica_avaliacoes_disponiveis_parceiro_routes,
          estatistica_avaliacoes_disponiveis_educador_routes
 } from "./routes/estatistica_gestao_avaliacoes.routes"; 


import { prisma } from "./lib/prisma";
import { logger, redactSensitiveData } from "./lib/logger";
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!JWT_SECRET) {
  console.error(
    "[FATAL] JWT_SECRET não está definida nas variáveis de ambiente. O servidor não pode iniciar.",
  );
  process.exit(1);
}
if (!COOKIE_SECRET) {
  console.error(
    "[FATAL] COOKIE_SECRET não está definida nas variáveis de ambiente. O servidor não pode iniciar.",
  );
  process.exit(1);
}
const app = fastify({
  trustProxy: true,
  logger: true,
}).withTypeProvider<ZodTypeProvider>();
const BLOCKED_IPS = new Set(
  (process.env.BLOCKED_IPS ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean),
);

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
app.decorate("prisma", prisma);
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
if (process.env.NODE_ENV !== "production") {
  app.addHook("preHandler", async (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method) && request.body) {
      console.log(
        `[${request.method}] ${request.url} Body:`,
        redactSensitiveData(request.body),
      );
    }
  });
}

app.addHook("onRequest", async (request, reply) => {
  if (!BLOCKED_IPS.size) return;

  const ips = [request.ip, request.raw.socket.remoteAddress].filter(
    (ip): ip is string => Boolean(ip),
  );
  if (!ips.some((ip) => BLOCKED_IPS.has(ip))) return;

  request.log.warn(
    {
      event: "blocked_ip",
      ip: request.ip,
      remoteAddress: request.raw.socket.remoteAddress,
      url: request.url,
    },
    "Blocked request by IP",
  );
  return reply.status(403).send({ message: "Acesso bloqueado." });
});

/** Log de todas as requisições HTTP recebidas (exceto health check) */
app.addHook("onResponse", async (request, reply) => {
  if (request.url === "/health" || request.url === "/") return;
  const userId = (request.user as any)?.sub ?? null;
  logger.request(
    request.method,
    request.url.split("?")[0],
    reply.statusCode,
    Math.round(reply.elapsedTime),
    userId,
    request.ip
  );
  // Auditoria de operações de escrita bem-sucedidas
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
    reply.statusCode < 400
  ) {
    const resource = request.url.split("?")[0].replace(/^\//, "").split("/")[0];
    const action =
      request.method === "POST"
        ? "CREATE"
        : request.method === "DELETE"
        ? "DELETE"
        : "UPDATE";
    logger.audit(action, resource, null, userId, request.ip);
  }
});
const ALLOWED_ORIGINS = new Set(
  [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
    "https://prosis.digital",
    "https://www.prosis.digital",
  ].filter(Boolean) as string[],
);
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isAllowedBrowserOrigin(value?: string) {
  if (!value) return true;
  try {
    return ALLOWED_ORIGINS.has(new URL(value).origin);
  } catch {
    return false;
  }
}

app.addHook("onRequest", async (request, reply) => {
  if (!STATE_CHANGING_METHODS.has(request.method)) return;

  const secFetchSite = request.headers["sec-fetch-site"];
  if (secFetchSite === "cross-site") {
    request.log.warn(
      { event: "csrf_fetch_metadata_block", url: request.url, ip: request.ip },
      "Blocked cross-site state-changing request",
    );
    return reply.status(403).send({ message: "Origem da requisicao nao permitida." });
  }

  const origin = request.headers.origin;
  if (typeof origin === "string" && !isAllowedBrowserOrigin(origin)) {
    request.log.warn(
      { event: "csrf_origin_block", origin, url: request.url, ip: request.ip },
      "Blocked state-changing request by Origin",
    );
    return reply.status(403).send({ message: "Origem da requisicao nao permitida." });
  }

  const referer = request.headers.referer;
  if (!origin && typeof referer === "string" && !isAllowedBrowserOrigin(referer)) {
    request.log.warn(
      { event: "csrf_referer_block", referer, url: request.url, ip: request.ip },
      "Blocked state-changing request by Referer",
    );
    return reply.status(403).send({ message: "Origem da requisicao nao permitida." });
  }
});
app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
});
app.get("/", async () => {
  return { status: "API Online", timestamp: new Date().toISOString() };
});
app.get("/health", async () => {
  return { status: "API Online" };
});
app.register(cookie, {
  secret: COOKIE_SECRET,
  hook: "onRequest",
});
app.register(jwt, {
  secret: JWT_SECRET,
  cookie: {
    cookieName: "token",
    signed: false,
  },
});
app.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.token;
      if (!token) {
        return reply.status(401).send({ message: "Token não encontrado." });
      }
      const decoded = app.jwt.verify(token);
      request.user = decoded as {
        sub: string;
        nome: string;
        role: string;
        tokenTipo?: string;
        tipoAcesso?: string;
      };
    } catch (err) {
      logger.auth.tokenInvalid(request.ip, request.url);
      return reply.status(401).send({ message: "Sessão inválida." });
    }
  },
);

// Rate limiting: apenas no endpoint de login (máx. 5 tentativas por IP em 15 min)
app.register(rateLimit, {
  global: false,
});

// Hook de autenticação global — todas as rotas exceto as públicas exigem JWT válido
const PUBLIC_ROUTES = new Set([
  "/login",
  "/primeiro-acesso",
  "/forgot-password",
  "/reset-password",
  "/health",
  "/",
]);

const APRENDIZ_LOOKUP_ROUTES = new Set([
  "/unidade",
  "/instituicoes-parceiras",
  "/parceiros",
  "/escolas",
  "/turmas",
  "/situacao-participante",
  "/areas",
  "/planos",
  "/motivo-desligamento",
  "/grau-parentesco",
  "/municipios",
]);

const EDUCADOR_PEDAGOGICO_ROUTE_PREFIXES = [
  "/attendance",
  "/areas",
  "/conceitos",
  "/cronogramas",
  "/cursos",
  "/disciplinas",
  "/educadores",
  "/faltas-capacitacao",
  "/geracao-cronogramas",
  "/geracao-cronogramas-semestre",
  "/plano-curricular",
  "/planos",
  "/presenca",
  "/relatorio",
  "/turmas",
];

function pathMatchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

type AuthenticatedRequestUser = {
  sub: string;
  role?: string;
  tokenTipo?: string;
  tipoAcesso?: string;
};

function isAprendizSession(user: AuthenticatedRequestUser) {
  return (
    user.role === "APRENDIZ" ||
    user.tokenTipo === "APRENDIZ" ||
    user.tipoAcesso === "APRENDIZ"
  );
}

function isEducadorSession(user: AuthenticatedRequestUser) {
  return (
    user.role === "EDUCADOR" ||
    user.tokenTipo === "EDUCADOR" ||
    user.tipoAcesso === "EDUCADOR"
  );
}

function isEmpresaSession(user: AuthenticatedRequestUser) {
  return (
    user.role === "EMPRESA" ||
    user.tokenTipo === "EMPRESA" ||
    user.tipoAcesso === "EMPRESA"
  );
}

function canAprendizUseRoute(
  request: FastifyRequest,
  path: string,
  user: AuthenticatedRequestUser,
) {
  if (request.method === "POST" && path === "/logout") return true;
  if (request.method === "GET" && APRENDIZ_LOOKUP_ROUTES.has(path)) return true;

  const ownRecordMatch = path.match(/^\/ca-aprendiz\/(\d+)$/);
  if (!ownRecordMatch) return false;

  return (
    ["GET", "PUT"].includes(request.method) &&
    ownRecordMatch[1] === String(user.sub)
  );
}

function canEducadorUseRoute(
  request: FastifyRequest,
  path: string,
  user: AuthenticatedRequestUser,
) {
  if (request.method === "POST" && path === "/logout") return true;
  if (request.method === "GET" && APRENDIZ_LOOKUP_ROUTES.has(path)) return true;
  if (
    request.method === "GET" &&
    (
      path === "/ca-aprendiz" ||
      path === "/ca-aprendiz/stats" ||
      /^\/ca-aprendiz\/\d+$/.test(path) ||
      /^\/ca-aprendiz\/\d+\/(?:alocacoes|capacitacoes)$/.test(path) ||
      path === "/alocacoes/filtros-ativos" ||
      /^\/alocacoes\/(?:aprendizes|alunos)-por-turma\/[^/]+$/.test(path)
    )
  ) {
    return true;
  }
  if (
    EDUCADOR_PEDAGOGICO_ROUTE_PREFIXES.some((prefix) =>
      pathMatchesPrefix(path, prefix),
    )
  ) {
    return true;
  }

  const ownRecordMatch = path.match(/^\/educadores\/(\d+)$/);
  if (!ownRecordMatch) return false;

  return (
    ["GET", "PUT"].includes(request.method) &&
    ownRecordMatch[1] === String(user.sub)
  );
}

function canEmpresaUseRoute(
  request: FastifyRequest,
  path: string,
  user: AuthenticatedRequestUser,
) {
  if (request.method === "POST" && path === "/logout") return true;
  if (
    request.method === "GET" &&
    (
      /^\/empresa\/aprendizes-alocados(?:\/\d+\/(?:detalhes|calendario))?$/.test(path) ||
      path === "/empresa/vagas" ||
      path === "/empresa/vagas/areas" ||
      path === "/empresa/avaliacoes" ||
      path === "/empresa/contagem-faltas" ||
      path === "/empresa/controle-presenca/por-periodo" ||
      path === "/empresa/controle-presenca/total-periodo"
    )
  ) {
    return true;
  }

  const ownRecordMatch = path.match(/^\/parceiros\/(\d+)$/);
  if (!ownRecordMatch) return false;

  return (
    ["GET", "PUT"].includes(request.method) &&
    ownRecordMatch[1] === String(user.sub)
  );
}

app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
  const path = request.url.split("?")[0];
  if (PUBLIC_ROUTES.has(path)) return;
  try {
    const token = request.cookies.token;
    if (!token) {
      return reply.status(401).send({ message: "Não autorizado." });
    }
    const decoded = app.jwt.verify(token);
    request.user = decoded as {
      sub: string;
      nome: string;
      role: string;
      tokenTipo?: string;
      tipoAcesso?: string;
    };
    const user = request.user as AuthenticatedRequestUser;
    if (isAprendizSession(user) && !canAprendizUseRoute(request, path, user)) {
      return reply.status(403).send({ message: "Acesso nao permitido." });
    }
    if (isEducadorSession(user) && !canEducadorUseRoute(request, path, user)) {
      return reply.status(403).send({ message: "Acesso nao permitido." });
    }
    if (isEmpresaSession(user) && !canEmpresaUseRoute(request, path, user)) {
      return reply.status(403).send({ message: "Acesso nao permitido." });
    }
  } catch {
    logger.auth.tokenInvalid(request.ip, request.url);
    return reply.status(401).send({ message: "Não autorizado." });
  }
});

app.register(userRoutes);
app.register(authRoutes);
app.register(unityRoutes);
app.register(instituicaoRoutes);
app.register(situacaoParticipanteRoutes);
app.register(motivoDesligamentoRoutes);
app.register(grauParentescoRoutes);
app.register(profissaoRoutes);
app.register(grauEscolaridadeRoutes);
app.register(feriadoRoutes);
app.register(occurrenceRoutes);
app.register(occurrenceTypeRoutes);
app.register(instituicoesParceirasRoutes);
app.register(statusEncaminhamentoRoutes);
app.register(cadastroRegiaoRoutes);
app.register(orientadorRoutes);
app.register(aprendizRoutes);
app.register(cadastroRamoAtividadeRoutes);
app.register(parceiroRoutes);
app.register(unidadeParceiroRoutes);
app.register(cursoRoutes);
app.register(disciplinaRoutes);
app.register(turmaRoutes);
app.register(conceitoRoutes);
app.register(areaAtuacaoRoutes);
app.register(vagaRoutes);
app.register(funcaoSistemaRoutes);
app.register(relatorioRoutes);
app.register(planoRoutes);
app.register(planoCurricularRoutes);
app.register(educadorRoutes);
app.register(attendanceRoutes);
app.register(presencaRoutes);
app.register(caAprendizRoutes);
app.register(escolaRoutes);
app.register(municipioRoutes);
app.register(rascunhoAprendizRoutes);
app.register(alocacaoRoutes);
app.register(capacitacaoRoutes);
app.register(faltasCapacitacaoRoutes);
app.register(registroGIRoutes);
app.register(cronogramaRoutes);
app.register(geracaoCronogramaRoutes);
app.register(geracaoCronogramaSemestreRoutes);
app.register(empresaAprendizRoutes);
// Inclusão register rota para Estatistica de Participantes por Situação
app.register(participantessituacaoroutes);
app.register(ativos_por_turma_routes);
app.register(ativos_area_atuacao_routes);
app.register(ativos_por_cidade_routes);
app.register(desligados_por_periodo_routes);
app.register(desligados_por_motivo_routes);
app.register(alocacao_no_periodo_routes);
app.register(ativos_por_unidade_routes);
app.register(tipo_de_pagamento_routes);
app.register(conheceu_projov_routes);
app.register(estatistica_aprendiz_por_parceiro_routes);
app.register(estatistica_gestao_avaliacoes_routes);
app.register(estatistica_avaliacoes_pendentes_routes);
app.register(estatistica_avaliacoes_realizadas_routes);
app.register(estatistica_avaliacoes_disponiveis_parceiro_routes);
app.register(estatistica_avaliacoes_disponiveis_educador_routes);


app.setErrorHandler((error: any, request, reply) => {
  if (error.validation) {
    console.error("Erro de Validação:", {
      validation: error.validation,
      context: error.validationContext,
      url: request.url,
      method: request.method,
      ip: request.ip,
    });
    logger.error("Erro de validação", {
      url: request.url,
      method: request.method,
      context: error.validationContext,
      ip: request.ip,
    });
    return reply.status(400).send({
      message: "Erro de validação nos dados enviados.",
      errors: error.validation,
    });
  }
  const statusCode = Number(error.statusCode);
  if (statusCode >= 400 && statusCode < 500) {
    request.log.warn(
      {
        event: "request_rejected",
        statusCode,
        url: request.url,
        method: request.method,
        ip: request.ip,
      },
      error.message ?? "Request rejected",
    );
    return reply.status(statusCode).send({
      message: error.message ?? "Requisicao rejeitada.",
    });
  }

  console.error(error);
  logger.error(error.message ?? "Erro interno do servidor", {
    url: request.url,
    method: request.method,
    statusCode: 500,
    stack: error.stack,
    ip: request.ip,
  });
  const msg = process.env.NODE_ENV !== "production"
    ? (error.message ?? "Erro interno do servidor")
    : "Erro interno do servidor";
  reply.status(500).send({ message: msg });
});
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3333;
  app.listen({ port, host: "0.0.0.0" }).then(() => {
    console.log(`HTTP Server running on port ${port}`);
  });
}
export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};
