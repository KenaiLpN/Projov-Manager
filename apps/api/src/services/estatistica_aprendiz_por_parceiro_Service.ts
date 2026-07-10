import { prisma } from "../lib/prisma";

export class EstatisticaAprendizPorParceiroService {
    async getRelatorioAprendizPorParceiro() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
          SELECT 
            S.Parcodigo,
            S.ParNomeFantasia,
            S.ParCidade,
            COUNT(A.Apr_Codigo) AS Qtde,
            SUM(CASE WHEN A.Apr_Situacao = 6 THEN 1 ELSE 0 END) AS TotalAtivo,
            SUM(CASE WHEN A.Apr_Situacao != 6 THEN 1 ELSE 0 END) AS TotalInativo
        FROM CA_Aprendiz A
        INNER JOIN CA_Parceiros S ON A.Apr_UnidadeParceiro = S.Parcodigo
        GROUP BY 
            S.Parcodigo,
            S.ParNomeFantasia,
            S.ParCidade`;

      // 2. Tratamento para BigInt e formatação de tipos
      // O Prisma retorna BigInt em queries brutas, o que causaria erro 500 no JSON
      return JSON.parse(
        JSON.stringify(resultado, (key, value) =>
          typeof value === "bigint" ? Number(value) : value
        )
      );

    } catch (error) {
      console.error("❌ Erro no Relatório Final (Query):", error);
      throw error;
    }
  }
  
}

