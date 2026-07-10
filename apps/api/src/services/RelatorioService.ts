import { prisma } from "../lib/prisma";

export class RelatorioService {
  async getRelatorioFinal(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // 1. Buscar a(s) turma(s) que contêm "Carga Horária Final" no nome
      const turmas = await prisma.cA_Turmas.findMany({
        where: {
          TurNome: {
            contains: "Carga Horária Final",
          },
        },
        select: {
          TurCodigo: true,
          TurNome: true,
        },
      });

      if (turmas.length === 0) return [];

      const turmaIds = turmas.map((t: any) => t.TurCodigo);

      // 2. Buscar alocações vinculadas a essas turmas cujo intervalo se sobrepõe ao período selecionado:
      //    ALADataInicio <= endDate  E  ALADataPrevTermino >= startDate
      const alocacoes = await prisma.cA_AlocacaoAprendiz.findMany({
        where: {
          ALATurma: { in: turmaIds },
          ALADataInicio: { lte: end },
          ALADataPrevTermino: { gte: start },
        },
        select: {
          ALAAprendiz: true,
          ALATurma: true,
          ALAUnidadeParceiro: true,
          ALADataInicio: true,
          ALADataPrevTermino: true,
        },
      });

      if (alocacoes.length === 0) return [];

      // 3. Buscar detalhes dos aprendizes, turmas e parceiros
      const aprendizIds = [...new Set(alocacoes.map((a: any) => a.ALAAprendiz))];
      const parceiroUnidadeIds = [...new Set(alocacoes.map((a: any) => a.ALAUnidadeParceiro))];

      const [aprendizes, unidadesParceiro] = await Promise.all([
        prisma.cA_Aprendiz.findMany({
          where: { Apr_Codigo: { in: aprendizIds.map((id: number) => BigInt(id)) } },
          select: {
            Apr_Codigo: true,
            Apr_Nome: true,
            Apr_InicioAprendizagem: true,
            Apr_PrevFimAprendizagem: true,
          },
        }),
        prisma.cA_ParceirosUnidade.findMany({
          where: { ParUniCodigo: { in: parceiroUnidadeIds } },
          select: {
            ParUniCodigo: true,
            ParUniDescricao: true,
            ParUniCNPJ: true,
          },
        }),
      ]);

      const aprendizMap = new Map(aprendizes.map((a: any) => [Number(a.Apr_Codigo), a]));
      const unidadMap = new Map(unidadesParceiro.map((u: any) => [u.ParUniCodigo, u]));
      const turmaMap = new Map(turmas.map((t: any) => [t.TurCodigo, t.TurNome]));

      // 4. Formatar o resultado final
      return alocacoes.map((a: any) => {
        const apr = aprendizMap.get(a.ALAAprendiz);
        const uni = unidadMap.get(a.ALAUnidadeParceiro);
        
        return {
          CodAprendiz: a.ALAAprendiz,
          Aprendiz: apr?.Apr_Nome || "N/A",
          Parceiro: uni?.ParUniDescricao || "N/A",
          CNPJParceiro: uni?.ParUniCNPJ || "N/A",
          InicioAprendizagem: apr?.Apr_InicioAprendizagem,
          PrevTermino: apr?.Apr_PrevFimAprendizagem,
          Turma: turmaMap.get(a.ALATurma) || "N/A",
          DataInicioTurma: a.ALADataInicio,
          DataTerminoTurma: a.ALADataPrevTermino,
        };
      });
    } catch (error) {
      console.error("Erro no Relatório Final:", error);
      throw error;
    }
  }
}
