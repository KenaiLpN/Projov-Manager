import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UnityService } from "../services/UnityService";
import {
  createUnityBodySchema,
  unityResponseSchema,
  listUnityResponseSchema,
  CreateUnityBody,
  listUnityQuerySchema,
  ListUnityQuery,
  updateUnityBodySchema,
  UpdateUnityParams,
  UpdateUnityBody,
  updateUnityParamsSchema,
  deleteUnityParamsSchema,
  DeleteUnityParams,
} from "../schemas/unitySchema";
import { z } from "zod";
const unityService = new UnityService();
export async function unityRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/unidade",
    {
      schema: {
        tags: ["Unidades"],
        summary: "Cria uma nova unidade no sistema",
        body: createUnityBodySchema,
        response: {
          201: unityResponseSchema,
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateUnityBody;
      try {
        const newUnity = await unityService.createUnity(body);
        return reply.status(201).send(newUnity);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao processar a requisição." });
        }
        return reply
          .status(500)
          .send({ message: "Um erro desconhecido ocorreu." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/unidade",
    {
      schema: {
        tags: ["Unidades"],
        summary: "Lista unidades com paginação",
        querystring: listUnityQuerySchema,
        response: {
          200: listUnityResponseSchema, 
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListUnityQuery;
      try {
        const result = await unityService.getAllUnities(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/unidade/:id",
    {
      schema: {
        tags: ["Unidades"],
        summary: "Atualiza dados de uma unidade existente",
        params: updateUnityParamsSchema,
        body: updateUnityBodySchema,
        response: {
          200: unityResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateUnityParams;
      const updateData = request.body as UpdateUnityBody;
      try {
        if (Object.keys(updateData).length === 0) {
          return reply
            .status(400)
            .send({ message: "Nenhum dado enviado para atualização." });
        }
        const updatedUnity = await unityService.updateUnity(
          Number(id),
          updateData,
        );
        if (!updatedUnity) {
          return reply.status(404).send({ message: "Unidade não encontrada." });
        }
        return reply.status(200).send(updatedUnity);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao atualizar unidade." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/unidade/:id",
    {
      schema: {
        tags: ["Unidades"],
        summary: "Exclui uma unidade do sistema",
        params: deleteUnityParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteUnityParams;
      try {
        const deleted = await unityService.deleteUnity(Number(id));
        if (deleted === null) {
          return reply.status(404).send({ message: "Unidade não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
}