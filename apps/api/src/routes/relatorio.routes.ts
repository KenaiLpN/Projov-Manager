import { FastifyInstance } from "fastify";
import { RelatorioService } from "../services/RelatorioService";

const relatorioService = new RelatorioService();

export async function relatorioRoutes(app: FastifyInstance) {
  app.get("/relatorio/carga_horaria_final", async (request, reply) => {
    try {
      const { startDate, endDate } = request.query as {
        startDate: string;
        endDate: string;
      };

      if (!startDate || !endDate) {
        return reply.status(400).send({
          error: "Datas de início e término são obrigatórias.",
        });
      }

      const result = await relatorioService.getRelatorioFinal(startDate, endDate);
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}
