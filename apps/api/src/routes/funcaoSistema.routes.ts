import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FuncaoSistemaService } from "../services/FuncaoSistemaService";
import { 
  createFuncaoSistemaBodySchema, 
  funcaoSistemaResponseSchema, 
  listFuncaoSistemaResponseSchema, 
  listFuncaoSistemaQuerySchema,
  updateFuncaoSistemaBodySchema,
} from "../schemas/funcaoSistemaSchema";

const service = new FuncaoSistemaService();

export async function funcaoSistemaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/funcoes-sistema",
    {
      schema: {
        querystring: listFuncaoSistemaQuerySchema,
        response: {
          200: listFuncaoSistemaResponseSchema,
        },
      },
    },
    async (request) => {
      const { page, limit, search } = request.query;
      return await service.getAll(page, limit, search);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/funcoes-sistema",
    {
      schema: {
        body: createFuncaoSistemaBodySchema,
        response: {
          201: funcaoSistemaResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = request.body;
      const created = await service.create(data);
      return reply.status(201).send(created);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/funcoes-sistema/:id",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
        body: updateFuncaoSistemaBodySchema,
        response: {
          200: funcaoSistemaResponseSchema,
        },
      },
    },
    async (request) => {
      const { id } = request.params;
      const data = request.body;
      return await service.update(id, data);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/funcoes-sistema/:id",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await service.delete(id);
      return reply.status(204).send(null);
    }
  );
}