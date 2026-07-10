import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { VagaService } from "../services/VagaService";
import { 
  createVagaBodySchema, 
  vagaResponseSchema, 
  listVagaResponseSchema, 
  listVagaQuerySchema, 
  ListVagaQuery, 
  CreateVagaBody, 
  updateVagaBodySchema, 
  UpdateVagaBody, 
} from "../schemas/vagaSchema";
import { z } from "zod";

const service = new VagaService();

export async function vagaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/vagas",
    {
      schema: {
        tags: ["Requisições de Vaga"],
        summary: "Cria uma nova requisição de vaga",
        body: createVagaBodySchema,
        // response: {
        //   201: vagaResponseSchema,
        // },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateVagaBody;
      try {
        const newItem = await service.create({
          ...body,
          // ReqUsuarioCadastro would ideally be the user from authenticate
        });
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar vaga." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/vagas",
    {
      schema: {
        tags: ["Requisições de Vaga"],
        summary: "Lista as requisições de vaga",
        querystring: listVagaQuerySchema,
        // response: {
        //   200: listVagaResponseSchema,
        // },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListVagaQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof Error) console.error("GET /vagas error:", error.message, error.stack);
        return reply.status(500).send({ message: "Erro ao listar vagas." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/vagas/:id",
    {
      schema: {
        tags: ["Requisições de Vaga"],
        summary: "Busca requisição por ID",
        params: z.object({ id: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const result = await service.getById(id);
        if (!result) return reply.status(404).send({ message: "Vaga não encontrada." });
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar vaga." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/vagas/:id",
    {
      schema: {
        tags: ["Requisições de Vaga"],
        summary: "Atualiza uma requisição de vaga",
        params: z.object({ id: z.coerce.number() }),
        body: updateVagaBodySchema,
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const body = request.body as UpdateVagaBody;
      try {
        const updated = await service.update(id, body);
        if (!updated) return reply.status(404).send({ message: "Vaga não encontrada." });
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar vaga." });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/vagas/:id",
    {
      schema: {
        tags: ["Requisições de Vaga"],
        summary: "Exclui uma requisição de vaga",
        params: z.object({ id: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const deleted = await service.delete(id);
        if (!deleted) return reply.status(404).send({ message: "Vaga não encontrada." });
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir vaga." });
      }
    }
  );
}
