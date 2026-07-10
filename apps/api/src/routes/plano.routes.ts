import { FastifyInstance } from "fastify";
import { PlanoService } from "../services/PlanoService";

const planoService = new PlanoService();

export async function planoRoutes(app: FastifyInstance) {
  app.get("/planos", async (request, reply) => {
    try {
      const { page, limit, search } = request.query as {
        page?: string;
        limit?: string;
        search?: string;
      };

      const result = await planoService.getAll(
        Number(page) || 1,
        Number(limit) || 10,
        search
      );
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar planos." });
    }
  });
  app.get("/planos/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const plano = await planoService.getById(Number(id));
      if (!plano) {
        return reply.status(404).send({ error: "Plano não encontrado." });
      }
      return plano;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar plano." });
    }
  });

  app.post("/planos", async (request, reply) => {
    try {
      const data = request.body as { PlanCurso: string; PlanDescricao?: string };
      const plano = await planoService.create(data);
      return reply.status(201).send(plano);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao criar plano." });
    }
  });

  app.put("/planos/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as { PlanCurso?: string; PlanDescricao?: string };
      const plano = await planoService.update(Number(id), data);
      return plano;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar plano." });
    }
  });

  app.delete("/planos/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await planoService.delete(Number(id));
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao deletar plano." });
    }
  });
}
