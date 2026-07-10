import { FastifyInstance } from "fastify";
import {  EstatisticaGestaoAvaliacaoService ,
          EstatisticaAvaliacoesPendentesService, 
          EstatisticaAvaliacoesRealizadasService,           
          EstatisticaAvaliacoesDisponiveisEducadorService,
          EstatisticaAvaliacoesDisponiveisParceiroService,
          EstatisticaLogTransacaoService
        } from "../services/Estatistica_Gestao_Avaliacoes_Service";
 
const estatisticaGestaoAvaliacoesService = new EstatisticaGestaoAvaliacaoService();
const estatisticaAvaliacoesPendentesService = new EstatisticaAvaliacoesPendentesService();
const estatisticaAvaliacoesRealizadasService = new EstatisticaAvaliacoesRealizadasService();
const estatisticaAvaliacoesDisponiveisEducadorService = new EstatisticaAvaliacoesDisponiveisEducadorService();
const estatisticaAvaliacoesDisponiveisParceiroService = new EstatisticaAvaliacoesDisponiveisParceiroService();
const estatisticaLogTransacaoService = new EstatisticaLogTransacaoService();

export async function estatistica_gestao_avaliacoes_routes(app: FastifyInstance) {
  app.get("/estatisticagestaoavaliacoes", async (request, reply) => {
    try {

      const result = await estatisticaGestaoAvaliacoesService.getRelatorioGestaoDeAvaliacoes();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function estatistica_avaliacoes_pendentes_routes(app: FastifyInstance) {
  app.get("/estatisticaavaliacoespendentes", async (request, reply) => {
    try {

      const result = await estatisticaAvaliacoesPendentesService.getRelatorioAvaliacoesPendentes();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function estatistica_avaliacoes_realizadas_routes(app: FastifyInstance) {
  app.get("/estatisticaavaliacoesrealizadas", async (request, reply) => {
    try {

      const result = await estatisticaAvaliacoesRealizadasService.getRelatorioAvaliacoesRealizadas();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function estatistica_avaliacoes_disponiveis_parceiro_routes(app: FastifyInstance) {
  app.get("/estatisticaavaliacoesdisponiveisparceiro", async (request, reply) => {
    try {

      const result = await estatisticaAvaliacoesDisponiveisParceiroService.getRelatorioAvaliacoesDisponiveisParceiro();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function estatistica_avaliacoes_disponiveis_educador_routes(app: FastifyInstance) {
  app.get("/estatisticaavaliacoesdisponiveiseducador", async (request, reply) => {
    try {

      const result = await estatisticaAvaliacoesDisponiveisEducadorService.getRelatorioAvaliacoesDisponiveisEducador();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function estatistica_log_transacoes_routes(app: FastifyInstance) {
  app.get("/estatisticalogtransacoes", async (request, reply) => {
    try {

      const result = await estatisticaLogTransacaoService.getRelatorioLogDeTransacoes();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}