import { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { PresencaService } from "../services/PresencaService";

const service = new PresencaService();

/** Converte YYYY-MM-DD para UTC midnight */
function toUtcDate(str: string): Date {
  return new Date(str + "T00:00:00.000Z");
}
function toUtcEndDate(str: string): Date {
  return new Date(str + "T23:59:59.999Z");
}

export async function presencaRoutes(app: FastifyInstance) {
  app.get(
    "/presenca/estatisticas-jovem/filtros",
    { schema: { tags: ["Presenca"] } },
    async (_request, reply: FastifyReply) => {
      return reply.send(await service.getEstatisticasPresencaJovemFiltros());
    }
  );

  app.get(
    "/presenca/estatisticas-jovem",
    {
      schema: {
        tags: ["Presenca"],
        querystring: z.object({
          statusId: z.coerce.number().optional(),
          unidadeParceiroId: z.coerce.number().optional(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { statusId, unidadeParceiroId } = request.query as {
        statusId?: number;
        unidadeParceiroId?: number;
      };
      return reply.send(
        await service.getEstatisticasPresencaJovem(statusId, unidadeParceiroId)
      );
    }
  );
  // GET /presenca/data — Presença por Data/Turma
  app.get(
    "/presenca/data",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          date: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, date } = request.query as { turmaId: number; date: string };
      const result = await service.getPresencaByData(turmaId, toUtcDate(date));
      return reply.send(result);
    }
  );

  // GET /presenca/turma-periodo — Presença Turma por Período
  app.get(
    "/presenca/turma-periodo",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getPresencaTurmaPeriodo(
        turmaId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/total-aulas-turma — Total Aulas Turma por Período
  app.get(
    "/presenca/turma-periodo-matriz",
    {
      schema: {
        tags: ["PresenÃ§a"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getMatrizPresencaTurmaPeriodo(
        turmaId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  app.get(
    "/presenca/total-aulas-turma",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getTotalAulasTurmaPeriodo(
        turmaId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  app.get(
    "/presenca/total-aulas-turma-capacitacao",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getTotalAulasTurmaPeriodoCapacitacao(
        turmaId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/conteudos — Conteúdos Lecionados por Período
  app.get(
    "/presenca/conteudos",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getConteudosLecionados(
        turmaId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/parceiro-periodo — Presença Parceiro por Período
  app.get(
    "/presenca/parceiro-periodo",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          parceiroId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { parceiroId, startDate, endDate } = request.query as {
        parceiroId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getPresencaParceiroPeriodo(
        parceiroId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/total-aulas-parceiro — Total Aulas Parceiro por Período
  app.get(
    "/presenca/total-aulas-parceiro",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          parceiroId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { parceiroId, startDate, endDate } = request.query as {
        parceiroId: number;
        startDate: string;
        endDate: string;
      };
      const result = await service.getTotalAulasParceiroPeriodo(
        parceiroId,
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/faltas-parceiro — Faltas por Parceiro no Período
  app.get(
    "/presenca/faltas-parceiro",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { startDate, endDate } = request.query as {
        startDate: string;
        endDate: string;
      };
      const result = await service.getFaltasParceiroPeriodo(
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/contagem-faltas — Contagem de Faltas por Período
  app.get(
    "/presenca/contagem-faltas",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          startDate: z.string(),
          endDate: z.string(),
          tipoPagamento: z.string().optional(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { startDate, endDate, tipoPagamento } = request.query as {
        startDate: string;
        endDate: string;
        tipoPagamento?: string;
      };
      const result = await service.getContagemFaltasPeriodo(
        toUtcDate(startDate),
        toUtcEndDate(endDate),
        tipoPagamento
      );
      return reply.send(result);
    }
  );

  // GET /presenca/aulas-dadas — Aulas Dadas no Período
  app.get(
    "/presenca/aulas-dadas",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { startDate, endDate } = request.query as {
        startDate: string;
        endDate: string;
      };
      const result = await service.getAulasDadasPeriodo(
        toUtcDate(startDate),
        toUtcEndDate(endDate)
      );
      return reply.send(result);
    }
  );

  // GET /presenca/aprendizes-faltas — Aprendizes com X+ Faltas
  app.get(
    "/presenca/aprendizes-faltas",
    {
      schema: {
        tags: ["Presença"],
        querystring: z.object({
          minFaltas: z.coerce.number().default(8),
          startDate: z.string(),
          endDate: z.string(),
          turmaId: z.coerce.number().optional(),
          parceiroId: z.coerce.number().optional(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { minFaltas, startDate, endDate, turmaId, parceiroId } = request.query as {
        minFaltas: number;
        startDate: string;
        endDate: string;
        turmaId?: number;
        parceiroId?: number;
      };
      const result = await service.getAprendizesComFaltas(
        minFaltas,
        toUtcDate(startDate),
        toUtcEndDate(endDate),
        turmaId,
        parceiroId
      );
      return reply.send(result);
    }
  );
}
