import { prisma } from "../lib/prisma";

export class ParticipanteSituacaoService {
    async getRelatorioAtivosPorturma() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            SELECT COUNT(A.Apr_Codigo) Qtde,
                   B.TurNome AS Turma
            FROM CA_Aprendiz A
            INNER JOIN CA_Turmas B ON (A.Apr_Turma = B.TurCodigo)
            INNER JOIN CA_SituacaoAprendiz S ON (S.StaCodigo=A.Apr_Situacao)
            WHERE S.StaCodigo IN (6)
            GROUP BY B.TurNome
            ORDER BY B.TurNome `;

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
  async getRelatorioFinal() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
        SELECT 
          COUNT(a.Apr_Codigo) AS Apr_Codigo ,
          s.StaDescricao  AS StatusAprendiz
        FROM CA_Aprendiz a
        INNER JOIN CA_SituacaoAprendiz s ON a.Apr_Situacao = s.StaCodigo
        WHERE a.Apr_Situacao >= 0
        GROUP BY s.StaDescricao 
      `;

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
  async getRelatorioAreaAtuacao() {
    try {
      const resultado = await prisma.$queryRaw`
 
        SELECT   COUNT(A.Apr_Codigo) as Qtde ,
                 B.AreaDescricao as Area
        FROM  CA_Aprendiz A
        INNER JOIN CA_AreaAtuacao B ON A.Apr_AreaAtuacao = B.AreaCodigo
        INNER JOIN CA_SituacaoAprendiz S ON A.Apr_Situacao = S.StaCodigo
        WHERE S.StaCodigo IN (6)
        GROUP BY B.AreaDescricao
      `;

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

  async getRelatorioPorCidade() {
    try {
      const resultado = await prisma.$queryRaw`
      select COUNT(A.Apr_Codigo) Qtde,A.Apr_Cidade As Cidade
      from CA_Aprendiz A
      INNER JOIN CA_SituacaoAprendiz S ON (S.StaCodigo=A.Apr_Situacao)
      WHERE S.StaCodigo IN (6)
      group by A.Apr_Cidade
      order by 2      `;

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
// 
  async getRelatorioDesligadosPorPeriodo() {
    try {
      const resultado = await prisma.$queryRaw`
        SELECT 
                Apr.Apr_Nome AS d_nome,
                T.TurNome AS d_turma,
                UNI.ParUniDescricao AS d_unidade,
                DATE_FORMAT(A.ALADataInicio, '%d/%m/%Y') AS d_DataInicio,
                DATE_FORMAT(A.ALADataPrevTermino, '%d/%m/%Y')  AS d_DataFim,
                Apr.Apr_beneficio as d_benficio,
                Apr.Apr_BolsaFamilia d_bolsa,
                Apr.Apr_Sexo d_genero,
                S.StaDescricao as d_situacao,
                DATE_FORMAT(Apr.Apr_DataDeNascimento, '%d/%m/%Y') as d_nascimento,
                TIMESTAMPDIFF(YEAR, Apr_DataDeNascimento, CURDATE()) AS d_idade 
              FROM CA_AlocacaoAprendiz A
              INNER JOIN CA_Turmas T ON A.ALATurma = T.TurCodigo
              INNER JOIN CA_Aprendiz Apr ON A.ALAAprendiz = Apr.Apr_Codigo
          INNER JOIN CA_SituacaoAprendiz S ON (S.StaCodigo=Apr.Apr_Situacao)
              LEFT JOIN CA_ParceirosUnidade UNI ON A.ALAUnidadeParceiro = UNI.ParUniCodigo
              WHERE S.StaCodigo IN (3,2,4,5)
            
          
          
      `;

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

  // 
  async getRelatorioDesligadosPorMotivo() {
    try {
      const resultado = await prisma.$queryRaw`
              SELECT  count(A.Apr_Codigo) Qtde,
                M.MotDescricao AS Motivo
        FROM CA_Aprendiz A              
        inner join CA_MotivoDesligamento M on (M.MotCodigo = A.AprMotivoDesligamento1)
        INNER JOIN CA_SituacaoAprendiz S ON (S.StaCodigo=A.Apr_Situacao)
        GROUP BY M.MotDescricao
      `;

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
async getRelatorioAlocacaoNoPeriodo() {
    try {
      const resultado = await prisma.$queryRaw`
         SELECT   COUNT(A.Apr_Codigo) AS Qtde ,
            S.ParnomeFantasia AS NomeFantasia
        FROM  CA_Aprendiz A
        INNER JOIN CA_Parceiros S ON A.Apr_UnidadeParceiro = S.ParCodigo
        GROUP BY S.ParnomeFantasia 
        ORDER BY S.ParnomeFantasia 
      `;

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
async getRelatorioAtivosPorUnidade() {
    try {
      const resultado = await prisma.$queryRaw`
      SELECT   COUNT(A.Apr_Codigo) AS Qtde ,
            S.UniNome AS Unidade
        FROM  CA_Aprendiz A
        INNER JOIN CA_Unidades S ON A.Apr_Unidade = S.UniCodigo
        GROUP BY S.UniNome 
        ORDER BY S.UniNome 
      `;

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
async getRelatorioTipoDePagamento() {
    try {
      const resultado = await prisma.$queryRaw`
      SELECT   COUNT(A.Apr_Codigo) AS Qtde ,
            CASE WHEN A.Apr_TipoContrato = 'E' THEN 'Empresa' 
                 WHEN A.Apr_TipoContrato = 'C' THEN 'ProJov' END   AS TipoPagamento
        FROM  CA_Aprendiz A
        INNER JOIN CA_SituacaoAprendiz S ON A.Apr_Situacao = S.StaCodigo
        WHERE S.StaCodigo IN (6)        
        AND A.Apr_TipoContrato IN ('E','C')
        GROUP BY A.Apr_TipoContrato 
        ORDER BY A.Apr_TipoContrato 
      `;

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

  async getRelatorioComoConheceuProjov() {
    try {
      const resultado = await prisma.$queryRaw`

      SELECT COUNT(Apr_Codigo) AS Qtde , 
        CASE WHEN Apr_ConhecInstituicao IS NULL THEN 'Não Informado' 
          WHEN Apr_ConhecInstituicao = '' THEN 'Não Informado' 
          ELSE Apr_ConhecInstituicao END ConhecInstituicao
      from CA_Aprendiz 
      GROUP BY CASE WHEN Apr_ConhecInstituicao IS NULL THEN 'Não Informado' 
          WHEN Apr_ConhecInstituicao = '' THEN 'Não Informado' 
          ELSE Apr_ConhecInstituicao END 
      ORDER BY 2
      `;

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

