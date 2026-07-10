import { FastifyInstance } from "fastify";
 import { EstatisticaAprendizPorParceiroService } from "../services/estatistica_aprendiz_por_parceiro_Service";


const estatisticaAprendizPorParceiroService = new EstatisticaAprendizPorParceiroService();
export async function estatistica_aprendiz_por_parceiro_routes(app: FastifyInstance) {
  app.get("/estatisticaaprendiz/porparceiro", async (request, reply) => {
    try {

      const result = await estatisticaAprendizPorParceiroService.getRelatorioAprendizPorParceiro();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

