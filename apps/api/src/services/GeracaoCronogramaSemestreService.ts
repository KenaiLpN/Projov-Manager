import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

type CronogramaSemestreFilters = {
  turmaId: number;
  dataInicio: string;
  search?: string;
  page: number;
  limit: number;
};

type GenerateCronogramaSemestreInput = {
  turmaId: number;
  dataInicio: string;
  usuario?: string | null;
};

type CronogramaSemestreRawRow = {
  codigo: bigint | number;
  nome: string | null;
  turmaId: number;
  turma: string | null;
  unidadeParceiroId: number | null;
  parceiro: string | null;
  dataInicio: string | null;
  dataPrevTermino: string | null;
};

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateBr(date?: string | null) {
  if (!date) return "";
  const [year, month, day] = date.substring(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

function buildSearchClause(search?: string) {
  const normalized = search?.trim();
  if (!normalized) {
    return Prisma.empty;
  }

  const like = `%${normalized}%`;
  const numeric = Number(normalized);
  const clauses = [
    Prisma.sql`Apr.Apr_Nome LIKE ${like}`,
    Prisma.sql`Tur.TurNome LIKE ${like}`,
    Prisma.sql`COALESCE(Par.ParNomeFantasia, Par.ParDescricao, Uni.ParUniDescricao, '') LIKE ${like}`,
  ];

  if (Number.isFinite(numeric)) {
    clauses.push(Prisma.sql`Apr.Apr_Codigo = ${numeric}`);
  }

  return Prisma.sql`AND (${Prisma.join(clauses, " OR ")})`;
}

function buildBaseSql(turmaId: number, dataInicio: string, search?: string) {
  const searchSql = buildSearchClause(search);
  const startExpr = Prisma.sql`
    COALESCE(
      IF(YEAR(Ala.ALADataInicio) = 0, NULL, Ala.ALADataInicio),
      IF(YEAR(Apr.Apr_InicioAprendizagem) = 0, NULL, Apr.Apr_InicioAprendizagem),
      IF(YEAR(Apr.Apr_DataInicioEmpresa) = 0, NULL, Apr.Apr_DataInicioEmpresa),
      ${dataInicio}
    )
  `;
  const endExpr = Prisma.sql`
    COALESCE(
      IF(YEAR(Ala.ALADataTermino) = 0, NULL, Ala.ALADataTermino),
      IF(YEAR(Ala.ALADataPrevTermino) = 0, NULL, Ala.ALADataPrevTermino),
      IF(YEAR(Apr.Apr_PrevFimAprendizagem) = 0, NULL, Apr.Apr_PrevFimAprendizagem)
    )
  `;

  return Prisma.sql`
      FROM CA_AlocacaoAprendiz Ala
      INNER JOIN CA_Aprendiz Apr ON Apr.Apr_Codigo = Ala.ALAAprendiz
      LEFT JOIN CA_Turmas Tur ON Tur.TurCodigo = Ala.ALATurma
      LEFT JOIN CA_ParceirosUnidade Uni ON Uni.ParUniCodigo = Ala.ALAUnidadeParceiro
      LEFT JOIN CA_Parceiros Par ON Par.ParCodigo = Uni.ParUniCodigoParceiro
      WHERE Ala.ALATurma = ${turmaId}
        AND COALESCE(Ala.ALAStatus, 'A') = 'A'
        AND DATE(${startExpr}) <= DATE(${dataInicio})
        AND (
          ${endExpr} IS NULL
          OR DATE(${endExpr}) >= DATE(${dataInicio})
        )
        ${searchSql}
    `;
}

function serializeRow(row: CronogramaSemestreRawRow) {
  return {
    codigo: Number(row.codigo),
    nome: row.nome ?? "",
    turmaId: Number(row.turmaId),
    turma: row.turma ?? `Turma ${Number(row.turmaId)}`,
    unidadeParceiroId: row.unidadeParceiroId === null ? null : Number(row.unidadeParceiroId),
    parceiro: row.parceiro ?? "",
    dataInicio: formatDateBr(row.dataInicio),
    dataInicioIso: row.dataInicio ?? "",
    dataPrevTermino: formatDateBr(row.dataPrevTermino),
    dataPrevTerminoIso: row.dataPrevTermino ?? "",
  };
}

export class GeracaoCronogramaSemestreService {
  async list(filters: CronogramaSemestreFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(Math.max(1, filters.limit || 10), 1000);
    const offset = (page - 1) * limit;
    const baseSql = buildBaseSql(filters.turmaId, filters.dataInicio, filters.search);

    const [rows, total] = await Promise.all([
      prisma.$queryRaw<CronogramaSemestreRawRow[]>(
        Prisma.sql`
          SELECT
            Apr.Apr_Codigo AS codigo,
            Apr.Apr_Nome AS nome,
            Ala.ALATurma AS turmaId,
            Tur.TurNome AS turma,
            Ala.ALAUnidadeParceiro AS unidadeParceiroId,
            COALESCE(Par.ParNomeFantasia, Par.ParDescricao, Uni.ParUniDescricao, '') AS parceiro,
            DATE_FORMAT(COALESCE(IF(YEAR(Ala.ALADataInicio) = 0, NULL, Ala.ALADataInicio), IF(YEAR(Apr.Apr_InicioAprendizagem) = 0, NULL, Apr.Apr_InicioAprendizagem), IF(YEAR(Apr.Apr_DataInicioEmpresa) = 0, NULL, Apr.Apr_DataInicioEmpresa)), '%Y-%m-%d') AS dataInicio,
            DATE_FORMAT(COALESCE(IF(YEAR(Ala.ALADataTermino) = 0, NULL, Ala.ALADataTermino), IF(YEAR(Ala.ALADataPrevTermino) = 0, NULL, Ala.ALADataPrevTermino), IF(YEAR(Apr.Apr_PrevFimAprendizagem) = 0, NULL, Apr.Apr_PrevFimAprendizagem)), '%Y-%m-%d') AS dataPrevTermino
          ${baseSql}
          ORDER BY Apr.Apr_Codigo ASC
          LIMIT ${limit} OFFSET ${offset}
        `,
      ),
      prisma.$queryRaw<Array<{ total: bigint | number }>>(
        Prisma.sql`
          SELECT COUNT(DISTINCT Apr.Apr_Codigo) AS total
          ${baseSql}
        `,
      ),
    ]);

    const totalCount = Number(total[0]?.total ?? 0);

    return {
      data: rows.map(serializeRow),
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
    };
  }

  async generate(input: GenerateCronogramaSemestreInput) {
    const dataBase = parseDateOnly(input.dataInicio);
    const result = await this.list({
      turmaId: input.turmaId,
      dataInicio: input.dataInicio,
      page: 1,
      limit: 1000,
    });

    if (result.data.length === 0) {
      throw new Error("Nenhum aprendiz encontrado para gerar o cronograma.");
    }

    await prisma.$transaction(
      result.data.map((row) =>
        prisma.$executeRaw`
          INSERT INTO CA_CronogramaSemestre
            (CseTurma, CseAprendiz, CseUnidadeParceiro, CseDataBase, CseDataInicio, CseDataPrevTermino, CseStatus, CseUsuario)
          VALUES
            (${input.turmaId}, ${row.codigo}, ${row.unidadeParceiroId}, ${dataBase}, ${row.dataInicioIso ? parseDateOnly(row.dataInicioIso) : null}, ${row.dataPrevTerminoIso ? parseDateOnly(row.dataPrevTerminoIso) : null}, ${"A"}, ${input.usuario ?? null})
          ON DUPLICATE KEY UPDATE
            CseUnidadeParceiro = VALUES(CseUnidadeParceiro),
            CseDataInicio = VALUES(CseDataInicio),
            CseDataPrevTermino = VALUES(CseDataPrevTermino),
            CseStatus = 'A',
            CseUsuario = VALUES(CseUsuario),
            CseDataAlteracao = CURRENT_TIMESTAMP
        `,
      ),
    );

    return {
      message: "Cronograma turma/semestre gerado com sucesso.",
      generated: result.data.length,
      rows: result.data,
    };
  }
}
