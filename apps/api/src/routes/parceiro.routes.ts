import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ParceiroService } from "../services/ParceiroService";
import {
  createParceiroBodySchema,
  parceiroResponseSchema,
  listParceiroResponseSchema,
  listParceiroQuerySchema,
  ListParceiroQuery,
  CreateParceiroBody,
  updateParceiroParamsSchema,
  updateParceiroBodySchema,
  UpdateParceiroParams,
  UpdateParceiroBody,
  deleteParceiroParamsSchema,
} from "../schemas/parceiroSchema";
import { z } from "zod";
const service = new ParceiroService();

const EMPRESA_PROFILE_FIELDS = new Set([
  "ParDescricao",
  "ParNomeFantasia",
  "ParCNPJ",
  "ParEndereco",
  "ParNumeroEndereco",
  "ParComplemento",
  "ParBairro",
  "ParCidade",
  "ParEstado",
  "ParCEP",
  "ParEmail",
  "ParTelefone",
  "ParCelular",
]);

export async function parceiroRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/parceiros",
    {
      schema: {
        tags: ["Parceiros (Empresas)"],
        summary: "Cria uma nova empresa parceira",
        body: createParceiroBodySchema,
        response: {
          201: parceiroResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateParceiroBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao criar empresa." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/parceiros",
    {
      schema: {
        tags: ["Parceiros (Empresas)"],
        summary: "Lista empresas parceiras",
        querystring: listParceiroQuerySchema,
        response: {
          200: listParceiroResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListParceiroQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/parceiros/:id",
    {
      schema: {
        tags: ["Parceiros (Empresas)"],
        summary: "Busca empresa por ID",
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: parceiroResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const result = await service.getById(id);
        if (!result)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/parceiros/:id",
    {
      schema: {
        tags: ["Parceiros (Empresas)"],
        summary: "Atualiza empresa parceira",
        params: updateParceiroParamsSchema,
        body: updateParceiroBodySchema,
        response: {
          200: parceiroResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateParceiroParams;
      const updateData = request.body as UpdateParceiroBody;
      try {
        const isEmpresaSession =
          request.user?.role === "EMPRESA" ||
          request.user?.tokenTipo === "EMPRESA" ||
          request.user?.tipoAcesso === "EMPRESA";
        const allowedData = isEmpresaSession
          ? Object.fromEntries(
              Object.entries(updateData).filter(([field]) => EMPRESA_PROFILE_FIELDS.has(field)),
            ) as UpdateParceiroBody
          : updateData;
        const updated = await service.update(Number(id), allowedData);
        if (!updated)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/parceiros/:id",
    {
      schema: {
        tags: ["Parceiros (Empresas)"],
        summary: "Exclui empresa parceira",
        params: z.object({ id: z.coerce.number() }),
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const deleted = await service.delete(Number(id));
        if (!deleted)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}
