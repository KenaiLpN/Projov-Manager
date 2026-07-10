import { prisma } from "../lib/prisma";

export class EstatisticaGestaoAvaliacaoService {
    async getRelatorioGestaoDeAvaliacoes() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
             
          SELECT 	 (SELECT A.ParNomeFantasia FROM CA_Parceiros A
                                            JOIN CA_ParceirosUnidade B ON (A.ParCodigo=B.ParUniCodigoParceiro)
                            WHERE B.ParUniCodigo=PA.PepParceiroCodigo
                                            LIMIT 1) AS Parceiro
              ,(SELECT CC.ParUniDescricao FROM CA_ParceirosUnidade CC WHERE CC.ParUniCodigo = PA.PepParceiroCodigo) AS Unidade
                ,(SELECT Apr.Apr_Nome FROM CA_Aprendiz Apr WHERE Apr.Apr_Codigo =PA.PepAprendiz ) as Aprendiz
                ,(SELECT PP.PesNome from CA_Pesquisa PP WHERE PP.PesCodigo = PA.PepPesquisaCodigo) AS PesquisaCodigo
                ,CASE PA.PepMes
                  WHEN 1 THEN 'Janeiro'
                  WHEN 2 THEN 'Fevereiro'
                  WHEN 3 THEN 'Março'
                  WHEN 4 THEN 'Abril'
                  WHEN 5 THEN 'Maio'
                  WHEN 6 THEN 'Junho'
                  WHEN 7 THEN 'Julho'
                  WHEN 8 THEN 'Agosto'
                  WHEN 9 THEN 'Setembro'
                  WHEN 10 THEN 'Outubro'
                  WHEN 11 THEN 'Novembro'
                  WHEN 12 THEN 'Dezembro'
                END AS MesLiteral
                ,PA.PepAno
                ,CASE WHEN PA.PepRealizada = 'S' THEN 'Realizada' else 'Pendente' END as  PepRealizada
                ,PA.PepAprendiz
                ,PA.PepDataRealizada
                ,PA.PepTutor
                ,PA.PepObservacao
                ,PA.PepOrientador
                ,PA.PepTurma
                ,PA.PepConsideracoes
            FROM CA_Pesquisa_Parceiro  PA   
            where PA.PepAno=YEAR(NOW())
            and PA.PepMes=MONTH(NOW())
            
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

export class EstatisticaAvaliacoesPendentesService {
    async getRelatorioAvaliacoesPendentes() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            SELECT 	 (SELECT CC.ParUniDescricao FROM CA_ParceirosUnidade CC WHERE CC.ParUniCodigo = PA.PepParceiroCodigo) AS Unidade
                ,(SELECT A.ParNomeFantasia FROM CA_Parceiros A
                                              JOIN CA_ParceirosUnidade B ON (A.ParCodigo=B.ParUniCodigoParceiro)
                              WHERE B.ParUniCodigo=PA.PepParceiroCodigo
                              limit 1
                                              ) AS Parceiro
                  ,(SELECT PP.PesNome from CA_Pesquisa PP WHERE PP.PesCodigo = PA.PepPesquisaCodigo) AS PesquisaCodigo
                  ,PA.PepPesquisaCodigo
                  ,(SELECT Apr.Apr_Nome FROM CA_Aprendiz Apr WHERE Apr.Apr_Codigo =PA.PepAprendiz ) as Aprendiz
                  ,PA.PepParceiroCodigo
                  ,PA.PepAno
                  ,PA.PepMes
                  ,CASE PA.PepMes
                    WHEN 1 THEN 'Janeiro'
                    WHEN 2 THEN 'Fevereiro'
                    WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril'
                    WHEN 5 THEN 'Maio'
                    WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho'
                    WHEN 8 THEN 'Agosto'
                    WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro'
                    WHEN 11 THEN 'Novembro'
                    WHEN 12 THEN 'Dezembro'
                  END AS MesLiteral
                  ,CASE WHEN PA.PepRealizada = 'S' THEN 'Realizada' else 'Pendente' END as  PepRealizada
                  ,PA.PepAprendiz
                  ,PA.PepDataRealizada
                  ,PA.PepTutor
                  ,PA.PepObservacao
                  ,PA.PepOrientador
                  ,PA.PepTurma
                  ,PA.PepConsideracoes
                  ,PA.PepCodigo
                  
              FROM CA_Pesquisa_Parceiro  PA   
              where PA.PepAno=YEAR(NOW())
              and PA.PepMes=MONTH(NOW())
              AND PA.PepRealizada='N' `;

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
export class EstatisticaAvaliacoesRealizadasService {
    async getRelatorioAvaliacoesRealizadas() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            SELECT 	 (SELECT CC.ParUniDescricao FROM CA_ParceirosUnidade CC WHERE CC.ParUniCodigo = PA.PepParceiroCodigo) AS Unidade
                ,(SELECT A.ParNomeFantasia FROM CA_Parceiros A
                                              JOIN CA_ParceirosUnidade B ON (A.ParCodigo=B.ParUniCodigoParceiro)
                              WHERE B.ParUniCodigo=PA.PepParceiroCodigo
                              limit 1
                                              ) AS Parceiro
                  ,(SELECT PP.PesNome from CA_Pesquisa PP WHERE PP.PesCodigo = PA.PepPesquisaCodigo) AS PesquisaCodigo
                  ,PA.PepPesquisaCodigo
                  ,(SELECT Apr.Apr_Nome FROM CA_Aprendiz Apr WHERE Apr.Apr_Codigo =PA.PepAprendiz ) as Aprendiz
                  ,PA.PepParceiroCodigo
                  ,PA.PepAno
                  ,PA.PepMes
                  ,CASE PA.PepMes
                    WHEN 1 THEN 'Janeiro'
                    WHEN 2 THEN 'Fevereiro'
                    WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril'
                    WHEN 5 THEN 'Maio'
                    WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho'
                    WHEN 8 THEN 'Agosto'
                    WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro'
                    WHEN 11 THEN 'Novembro'
                    WHEN 12 THEN 'Dezembro'
                  END AS MesLiteral
                  ,CASE WHEN PA.PepRealizada = 'S' THEN 'Realizada' else 'Pendente' END as  PepRealizada
                  ,PA.PepAprendiz
                  ,PA.PepDataRealizada
                  ,PA.PepTutor
                  ,PA.PepObservacao
                  ,PA.PepOrientador
                  ,PA.PepTurma
                  ,PA.PepConsideracoes
                  ,PA.PepCodigo
                  
              FROM CA_Pesquisa_Parceiro  PA   
              where PA.PepAno=YEAR(NOW())
              and PA.PepMes=MONTH(NOW())
              AND PA.PepRealizada='S'`;

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
export class EstatisticaAvaliacoesDisponiveisParceiroService {
    async getRelatorioAvaliacoesDisponiveisParceiro() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            SELECT 	 (SELECT A.ParNomeFantasia FROM CA_Parceiros A
                                            JOIN CA_ParceirosUnidade B ON (A.ParCodigo=B.ParUniCodigoParceiro)
                            WHERE B.ParUniCodigo=PA.PepParceiroCodigo
                                            LIMIT 1) AS Parceiro
              ,(SELECT CC.ParUniDescricao FROM CA_ParceirosUnidade CC WHERE CC.ParUniCodigo = PA.PepParceiroCodigo) AS Unidade                                  
                ,(SELECT Apr.Apr_Nome FROM CA_Aprendiz Apr WHERE Apr.Apr_Codigo =PA.PepAprendiz ) as Aprendiz
                ,(SELECT PP.PesNome from CA_Pesquisa PP WHERE PP.PesCodigo = PA.PepPesquisaCodigo) AS PesquisaCodigo
                ,CASE PA.PepMes
                  WHEN 1 THEN 'Janeiro'
                  WHEN 2 THEN 'Fevereiro'
                  WHEN 3 THEN 'Março'
                  WHEN 4 THEN 'Abril'
                  WHEN 5 THEN 'Maio'
                  WHEN 6 THEN 'Junho'
                  WHEN 7 THEN 'Julho'
                  WHEN 8 THEN 'Agosto'
                  WHEN 9 THEN 'Setembro'
                  WHEN 10 THEN 'Outubro'
                  WHEN 11 THEN 'Novembro'
                  WHEN 12 THEN 'Dezembro'
                END AS MesLiteral
                ,PA.PepAno
                ,CASE WHEN PA.PepRealizada = 'S' THEN 'Realizada' else 'Pendente' END as  PepRealizada
                ,PA.PepAprendiz
                ,PA.PepDataRealizada
                ,PA.PepTutor
                ,PA.PepObservacao
                ,PA.PepOrientador
                ,PA.PepTurma
                ,PA.PepConsideracoes
            FROM CA_Pesquisa_Parceiro  PA   
            where PA.PepAno=YEAR(NOW())
            and PA.PepMes=MONTH(NOW())
            and PA.PepRealizada = 'N'
            AND PA.PepPesquisaCodigo=12 `;

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
export class EstatisticaAvaliacoesDisponiveisEducadorService {
    async getRelatorioAvaliacoesDisponiveisEducador() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            
          SELECT 	 (SELECT A.ParNomeFantasia FROM CA_Parceiros A
                                            JOIN CA_ParceirosUnidade B ON (A.ParCodigo=B.ParUniCodigoParceiro)
                            WHERE B.ParUniCodigo=PA.PepParceiroCodigo
                                            LIMIT 1) AS Parceiro
              ,(SELECT CC.ParUniDescricao FROM CA_ParceirosUnidade CC WHERE CC.ParUniCodigo = PA.PepParceiroCodigo) AS Unidade                                  
                ,(SELECT Apr.Apr_Nome FROM CA_Aprendiz Apr WHERE Apr.Apr_Codigo =PA.PepAprendiz ) as Aprendiz
                ,(SELECT PP.PesNome from CA_Pesquisa PP WHERE PP.PesCodigo = PA.PepPesquisaCodigo) AS PesquisaCodigo
                ,CASE PA.PepMes
                  WHEN 1 THEN 'Janeiro'
                  WHEN 2 THEN 'Fevereiro'
                  WHEN 3 THEN 'Março'
                  WHEN 4 THEN 'Abril'
                  WHEN 5 THEN 'Maio'
                  WHEN 6 THEN 'Junho'
                  WHEN 7 THEN 'Julho'
                  WHEN 8 THEN 'Agosto'
                  WHEN 9 THEN 'Setembro'
                  WHEN 10 THEN 'Outubro'
                  WHEN 11 THEN 'Novembro'
                  WHEN 12 THEN 'Dezembro'
                END AS MesLiteral
                ,PA.PepAno
                ,CASE WHEN PA.PepRealizada = 'S' THEN 'Realizada' else 'Pendente' END as  PepRealizada
                ,PA.PepAprendiz
                ,PA.PepDataRealizada
                ,PA.PepTutor
                ,PA.PepObservacao
                ,PA.PepOrientador
                ,PA.PepTurma
                ,PA.PepConsideracoes
            FROM CA_Pesquisa_Parceiro  PA   
            where PA.PepAno=YEAR(NOW())
            and PA.PepMes=MONTH(NOW())
            and PA.PepRealizada = 'N'
            AND PA.PepPesquisaCodigo=8
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

export class EstatisticaLogTransacaoService {
    async getRelatorioLogDeTransacoes() {
    try {
      // 1. Executa a Query SQL com JOIN entre Aprendiz e Situacao
      // Usamos o queryRaw para trazer os dados já relacionados
      const resultado = await prisma.$queryRaw`
            
          SELECT Log_Aprendiz
              ,Log_usuario
              ,Log_Data
              ,Log_Tela
              ,Log_Ip
              ,Log_Turma
          FROM CA_LogTransacao
        order by Log_Data desc,Log_usuario
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



