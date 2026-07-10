import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { EmpresaAprendizService } from "../services/EmpresaAprendizService";
import { PresencaService } from "../services/PresencaService";
import { EmpresaPortalService } from "../services/EmpresaPortalService";
import { VagaService } from "../services/VagaService";
import { createVagaBodySchema } from "../schemas/vagaSchema";

const service = new EmpresaAprendizService();
const presencaService = new PresencaService();
const portalService = new EmpresaPortalService();
const vagaService = new VagaService();

function toUtcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toUtcEndDate(value: string) {
  return new Date(`${value}T23:59:59.999Z`);
}

function partnerId(request: { user: { sub: string } }) {
  return Number(request.user.sub);
}

function isEmpresa(request: { user: { role?: string; tokenTipo?: string; tipoAcesso?: string } }) {
  return (
    request.user.role === "EMPRESA" ||
    request.user.tokenTipo === "EMPRESA" ||
    request.user.tipoAcesso === "EMPRESA"
  );
}

export async function empresaAprendizRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/vagas",
    {
      schema: { querystring: z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(25), search: z.string().optional() }) },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      const { page, limit, search } = request.query as { page: number; limit: number; search?: string };
      return reply.send(await vagaService.getAll(page, limit, search, partnerId(request as any)));
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/vagas/areas",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      return reply.send(await portalService.areas());
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/empresa/vagas",
    { schema: { body: createVagaBodySchema.omit({ ReqEmpresa: true }) }, preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      return reply.status(201).send(await vagaService.create({ ...(request.body as any), ReqEmpresa: partnerId(request as any) }));
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/avaliacoes",
    { schema: { querystring: z.object({ status: z.enum(["pendentes", "realizadas"]).default("pendentes") }) }, preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      return reply.send(await portalService.assessments(partnerId(request as any), (request.query as any).status));
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/contagem-faltas",
    {
      schema: { querystring: z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }) },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      const { startDate, endDate } = request.query as { startDate: string; endDate: string };
      if (startDate > endDate) return reply.status(400).send({ message: "A data inicial deve ser anterior a data final." });
      return reply.send(await portalService.absences(partnerId(request as any), toUtcDate(startDate), toUtcEndDate(endDate)));
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/controle-presenca/total-periodo",
    {
      schema: {
        tags: ["Empresa - Presenca"],
        querystring: z.object({
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      if (!isEmpresa(request as any)) {
        return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      }

      const { startDate, endDate } = request.query as { startDate: string; endDate: string };
      if (startDate > endDate) {
        return reply.status(400).send({ message: "A data inicial deve ser anterior a data final." });
      }

      return reply.send(
        await presencaService.getTotalAulasEmpresaPeriodo(
          partnerId(request as any),
          toUtcDate(startDate),
          toUtcEndDate(endDate),
        ),
      );
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/controle-presenca/por-periodo",
    {
      schema: {
        tags: ["Empresa - Presenca"],
        querystring: z.object({
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      if (!isEmpresa(request as any)) {
        return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      }

      const { startDate, endDate } = request.query as { startDate: string; endDate: string };
      if (startDate > endDate) {
        return reply.status(400).send({ message: "A data inicial deve ser anterior a data final." });
      }

      return reply.send(
        await presencaService.getPresencaEmpresaPeriodo(
          partnerId(request as any),
          toUtcDate(startDate),
          toUtcEndDate(endDate),
        ),
      );
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/aprendizes-alocados",
    {
      schema: {
        tags: ["Empresa - Aprendizes"],
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1),
          limit: z.coerce.number().int().min(1).max(100).default(10),
          search: z.string().optional(),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      const { page, limit, search } = request.query as { page: number; limit: number; search?: string };
      return reply.send(await service.list(partnerId(request as any), page, limit, search));
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/aprendizes-alocados/:aprendizId/detalhes",
    {
      schema: {
        tags: ["Empresa - Aprendizes"],
        params: z.object({ aprendizId: z.coerce.number().int().positive() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      const { aprendizId } = request.params as { aprendizId: number };
      const result = await service.details(partnerId(request as any), aprendizId);
      return result
        ? reply.send(result)
        : reply.status(404).send({ message: "Aprendiz nao vinculado a esta empresa." });
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/empresa/aprendizes-alocados/:aprendizId/calendario",
    {
      schema: {
        tags: ["Empresa - Aprendizes"],
        params: z.object({ aprendizId: z.coerce.number().int().positive() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      if (!isEmpresa(request as any)) return reply.status(403).send({ message: "Acesso exclusivo para empresas." });
      const { aprendizId } = request.params as { aprendizId: number };
      const result = await service.calendar(partnerId(request as any), aprendizId);
      return result
        ? reply.send(result)
        : reply.status(404).send({ message: "Aprendiz nao vinculado a esta empresa." });
    },
  );
}
