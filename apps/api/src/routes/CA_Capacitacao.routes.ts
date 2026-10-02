import { createCapacitacaoBodySchema, updateCapacitacaoBodySchema, recordIdSchema } from "../schemas/pedagogyWriteSchema";
import { BusinessError } from "../lib/businessError";
import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CA_CapacitacaoService } from "../services/CA_CapacitacaoService";

const service = new CA_CapacitacaoService();

export async function capacitacaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ca-aprendiz/:id/capacitacoes",
    {
      schema: {
        tags: ["Capacitacao"],
        params: z.object({ id: recordIdSchema }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const data = await service.getByAprendiz(id);
        return reply.send(data);
      } catch {
        return reply.status(500).send({ message: "Erro ao listar capacitações." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/ca-aprendiz/:id/capacitacoes",
    {
      schema: {
        tags: ["Capacitacao"],
        params: z.object({ id: recordIdSchema }),
        body: createCapacitacaoBodySchema,
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const created = await service.create(id, request.body);
        return reply.status(201).send(created);
      } catch (error: any) {
        return reply.status(error instanceof BusinessError ? error.statusCode : 500).send({ message: error instanceof BusinessError ? error.message : "Erro ao salvar capacitação." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/ca-aprendiz/capacitacoes/:seq",
    {
      schema: {
        tags: ["Capacitacao"],
        params: z.object({ seq: recordIdSchema }),
        body: updateCapacitacaoBodySchema,
      },
    },
    async (request, reply: FastifyReply) => {
      const { seq } = request.params as { seq: number };
      try {
        const updated = await service.update(seq, request.body);
        return reply.send(updated);
      } catch (error: any) {
        return reply.status(error instanceof BusinessError ? error.statusCode : 500).send({ message: error instanceof BusinessError ? error.message : "Erro ao salvar capacitação." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/ca-aprendiz/capacitacoes/:seq",
    {
      schema: {
        tags: ["Capacitacao"],
        params: z.object({ seq: recordIdSchema }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { seq } = request.params as { seq: number };
      try {
        await service.delete(seq);
        return reply.status(204).send();
      } catch {
        return reply.status(500).send({ message: "Erro ao excluir capacitação." });
      }
    },
  );
}
