import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { EducadorService } from "../services/EducadorService";
import {
  createEducadorBodySchema,
  updateEducadorBodySchema,
  listEducadorQuerySchema,
  ListEducadorQuery,
  CreateEducadorBody,
  UpdateEducadorBody,
} from "../schemas/educadorSchema";
import { z } from "zod";

const service = new EducadorService();

const EDUCATOR_PROFILE_FIELDS = new Set([
  "EducNome",
  "EducCPF",
  "EducEMail",
  "EducTelefone",
  "EducTelefoneCelular",
  "EducEndereco",
  "EducNumeroEndereco",
  "EducComplemento",
  "EducBairro",
  "EducCidade",
  "EducUF",
  "EducCEP",
]);

export async function educadorRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/educadores",
    {
      schema: {
        tags: ["Educadores"],
        summary: "Cria um novo educador",
        body: createEducadorBodySchema,
        response: {
          201: z.any(),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateEducadorBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao criar educador." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/educadores",
    {
      schema: {
        tags: ["Educadores"],
        summary: "Lista educadores",
        querystring: listEducadorQuerySchema,
        response: {
          200: z.any(),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListEducadorQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error: any) {
        console.error("DEBUG - Erro detalhado:", error);
        return reply.status(500).send({ 
          error: "Erro ao listar educadores.", 
          message: error.message,
          code: error.code // Prisma error code if available
        });
      }

    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/educadores/:id",
    {
      schema: {
        tags: ["Educadores"],
        summary: "Busca educador por ID",
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: z.any(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const item = await service.getById(id);
        if (!item) {
          return reply.status(404).send({ message: "Educador não encontrado." });
        }
        return reply.status(200).send(item);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar educador." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/educadores/:id",
    {
      schema: {
        tags: ["Educadores"],
        summary: "Atualiza educador",
        params: z.object({ id: z.coerce.number() }),
        body: updateEducadorBodySchema,
        response: {
          200: z.any(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const body = request.body as UpdateEducadorBody;
      try {
        const isEducadorSession =
          request.user?.role === "EDUCADOR" ||
          request.user?.tokenTipo === "EDUCADOR" ||
          request.user?.tipoAcesso === "EDUCADOR";
        const updateData = isEducadorSession
          ? Object.fromEntries(
              Object.entries(body).filter(([field]) => EDUCATOR_PROFILE_FIELDS.has(field)),
            ) as UpdateEducadorBody
          : body;
        const updated = await service.update(id, updateData);
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar educador." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/educadores/:id",
    {
      schema: {
        tags: ["Educadores"],
        summary: "Exclui educador",
        params: z.object({ id: z.coerce.number() }),
        response: {
          204: z.null(),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        await service.delete(id);
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir educador." });
      }
    }
  );
}
