import { FastifyInstance } from "fastify";
 import { ParticipanteSituacaoService } from "../services/ParticipanteSituacaoService";


const participanteSituacaoService = new ParticipanteSituacaoService();
export async function participantessituacaoroutes(app: FastifyInstance) {
  app.get("/participantessituacao/carga_horaria_final", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioFinal();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function ativos_por_turma_routes(app: FastifyInstance) {
  app.get("/participantessituacao/ativos_por_turma", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioAtivosPorturma();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}
export async function ativos_area_atuacao_routes(app: FastifyInstance) {
  app.get("/participantessituacao/ativos_por_area_atuacao", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioAreaAtuacao();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function ativos_por_cidade_routes(app: FastifyInstance) {
  app.get("/participantessituacao/ativos_por_cidade", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioPorCidade();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function desligados_por_periodo_routes(app: FastifyInstance) {
  app.get("/participantessituacao/desligados_por_periodo", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioDesligadosPorPeriodo();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function desligados_por_motivo_routes(app: FastifyInstance) {
  app.get("/participantessituacao/desligados_por_motivo", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioDesligadosPorMotivo();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function alocacao_no_periodo_routes(app: FastifyInstance) {
  app.get("/participantessituacao/alocacao_no_periodo", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioAlocacaoNoPeriodo();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function ativos_por_unidade_routes(app: FastifyInstance) {
  app.get("/participantessituacao/ativos_por_unidade", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioAtivosPorUnidade();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function tipo_de_pagamento_routes(app: FastifyInstance) {
  app.get("/participantessituacao/tipo_pagamento", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioTipoDePagamento();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}

export async function conheceu_projov_routes(app: FastifyInstance) {
  app.get("/participantessituacao/conheceu_projov", async (request, reply) => {
    try {

      const result = await participanteSituacaoService.getRelatorioComoConheceuProjov();
      return result;
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao gerar relatório.",
      });
    }
  });
}