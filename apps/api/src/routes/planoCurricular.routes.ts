import { FastifyInstance, FastifyReply } from "fastify";
import { PlanoCurricularService } from "../services/PlanoCurricularService";

const service = new PlanoCurricularService();

export async function planoCurricularRoutes(app: FastifyInstance) {
  // GET /plano-curricular
  app.get("/plano-curricular", async (request, reply: FastifyReply) => {
    const { page, limit, search } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    try {
      const result = await service.getAll(
        Number(page) || 1,
        Number(limit) || 10,
        search
      );
      return reply.status(200).send(result);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao listar planos curriculares." });
    }
  });

  // POST /plano-curricular
  app.post("/plano-curricular", async (request, reply: FastifyReply) => {
    const body = request.body as {
      PlcCodigoPlano: number;
      PlcDisciplina: number;
      PlcCargaHoraria?: number;
      PlcTipoAvaliacao?: string;
      PlcNumeroAulas?: number;
      PlcDescricao?: string;
      PlcOrdemDisciplina?: number;
      PlcGeraCronograma?: string;
      EducCodigo?: number;
    };
    try {
      const created = await service.create(body);
      return reply.status(201).send(created);
    } catch (error: any) {
      console.error(error);
      // Violação de chave única (registro já existe)
      if (error?.code === "P2002") {
        return reply
          .status(409)
          .send({ error: "Já existe um registro para este plano e disciplina." });
      }
      return reply.status(500).send({ error: "Erro ao criar plano curricular." });
    }
  });

  // PUT /plano-curricular/:codigoPlano/:disciplina
  app.put(
    "/plano-curricular/:codigoPlano/:disciplina",
    async (request, reply: FastifyReply) => {
      const { codigoPlano, disciplina } = request.params as {
        codigoPlano: string;
        disciplina: string;
      };
      const body = request.body as {
        PlcCargaHoraria?: number | null;
        PlcTipoAvaliacao?: string | null;
        PlcNumeroAulas?: number | null;
        PlcDescricao?: string | null;
        PlcOrdemDisciplina?: number | null;
        PlcGeraCronograma?: string | null;
        EducCodigo?: number | null;
      };
      try {
        const updated = await service.update(
          Number(codigoPlano),
          Number(disciplina),
          body
        );
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Erro ao atualizar plano curricular." });
      }
    }
  );

  // DELETE /plano-curricular/:codigoPlano/:disciplina
  app.delete(
    "/plano-curricular/:codigoPlano/:disciplina",
    async (request, reply: FastifyReply) => {
      const { codigoPlano, disciplina } = request.params as {
        codigoPlano: string;
        disciplina: string;
      };
      try {
        await service.delete(Number(codigoPlano), Number(disciplina));
        return reply.status(204).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Erro ao excluir plano curricular." });
      }
    }
  );
}