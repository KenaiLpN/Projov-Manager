import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

type CronogramaFilters = {
  turmaId?: number;
  disciplinaId?: number;
  educadorId?: number;
  sequencia?: number;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
};

type GenerateCronogramaInput = {
  turmaId: number;
  disciplinaId: number;
  educadorId: number;
  quantidade: number;
  dataInicio: string;
  sequencia: number;
  usuario?: string | null;
};

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateBr(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function normalizeLegacyWeekday(value?: string | null) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 7) return null;
  return numeric - 1;
}

function resolveWeekdays(primary?: string | null, secondary?: string | null) {
  const start = normalizeLegacyWeekday(primary);
  const end = normalizeLegacyWeekday(secondary);
  if (start === null) return null;
  if (end === null || end < start) return new Set([start]);

  const days = new Set<number>();
  for (let day = start; day <= end; day += 1) {
    days.add(day);
  }
  return days;
}

function normalizeQuantidade(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    throw new Error("A quantidade deve ser maior que zero.");
  }
  if (value > 300) {
    throw new Error("A quantidade maxima permitida e 300.");
  }
  return Math.floor(value);
}

function buildListWhere(filters: Partial<CronogramaFilters>) {
  const clauses: Prisma.Sql[] = [Prisma.sql`CroStatus = 'A'`];

  if (filters.turmaId) {
    clauses.push(Prisma.sql`CroTurma = ${filters.turmaId}`);
  }
  if (filters.disciplinaId) {
    clauses.push(Prisma.sql`CroDisciplina = ${filters.disciplinaId}`);
  }
  if (filters.educadorId) {
    clauses.push(Prisma.sql`CroEducador = ${filters.educadorId}`);
  }
  if (filters.sequencia) {
    clauses.push(Prisma.sql`CroSequencia = ${filters.sequencia}`);
  }
  if (filters.startDate) {
    clauses.push(Prisma.sql`CroDataAula >= ${parseDateOnly(filters.startDate)}`);
  }
  if (filters.endDate) {
    clauses.push(Prisma.sql`CroDataAula <= ${parseDateOnly(filters.endDate)}`);
  }

  return {
    whereSql: Prisma.join(clauses, " AND "),
  };
}

export class GeracaoCronogramaService {
  async generate(input: GenerateCronogramaInput) {
    const quantidade = normalizeQuantidade(input.quantidade);
    const dataInicio = parseDateOnly(input.dataInicio);

    const [turma, disciplina, educador] = await Promise.all([
      prisma.cA_Turmas.findUnique({
        where: { TurCodigo: input.turmaId },
        select: {
          TurCodigo: true,
          TurNome: true,
          TurDiaSemana: true,
          TurDiaSemana02: true,
          TurUnidade: true,
        },
      }),
      prisma.cA_Disciplinas.findUnique({
        where: { DisCodigo: input.disciplinaId },
        select: { DisCodigo: true, DisDescricao: true },
      }),
      prisma.cA_Educadores.findUnique({
        where: { EducCodigo: input.educadorId },
        select: { EducCodigo: true, EducNome: true },
      }),
    ]);

    if (!turma) throw new Error("Turma nao encontrada.");
    if (!disciplina) throw new Error("Disciplina nao encontrada.");
    if (!educador) throw new Error("Professor nao encontrado.");

    const weekdays = resolveWeekdays(turma.TurDiaSemana, turma.TurDiaSemana02);
    const holidayWindowEnd = new Date(dataInicio);
    holidayWindowEnd.setDate(holidayWindowEnd.getDate() + quantidade * 14 + 365);

    const feriados = await prisma.cA_Feriados.findMany({
      where: {
        FerData: {
          gte: dataInicio,
          lte: holidayWindowEnd,
        },
        ...(turma.TurUnidade
          ? { OR: [{ FerUnidade: turma.TurUnidade }, { FerUnidade: 0 }] }
          : {}),
      },
      select: { FerData: true },
    });
    const holidayKeys = new Set(feriados.map((feriado) => toDateKey(feriado.FerData)));

    const dates: Date[] = [];
    const guardLimit = quantidade * 30 + 365;
    const current = new Date(dataInicio);
    let guard = 0;

    while (dates.length < quantidade && guard < guardLimit) {
      const key = toDateKey(current);
      const isAllowedWeekday = weekdays === null || weekdays.has(current.getDay());
      if (isAllowedWeekday && !holidayKeys.has(key)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
      guard += 1;
    }

    if (dates.length < quantidade) {
      throw new Error("Nao foi possivel montar todas as datas do cronograma.");
    }

    const data = dates.map((date) => ({
      CroTurma: input.turmaId,
      CroDisciplina: input.disciplinaId,
      CroEducador: input.educadorId,
      CroQuantidade: quantidade,
      CroDataInicio: dataInicio,
      CroDataAula: date,
      CroSequencia: input.sequencia,
      CroStatus: "A",
      CroUsuario: input.usuario ?? null,
    }));

    await prisma.$transaction(
      data.map((row) =>
        prisma.$executeRaw`
          INSERT IGNORE INTO CA_Cronogramas
            (CroTurma, CroDisciplina, CroEducador, CroQuantidade, CroDataInicio, CroDataAula, CroSequencia, CroStatus, CroUsuario)
          VALUES
            (${row.CroTurma}, ${row.CroDisciplina}, ${row.CroEducador}, ${row.CroQuantidade}, ${row.CroDataInicio}, ${row.CroDataAula}, ${row.CroSequencia}, ${row.CroStatus}, ${row.CroUsuario})
        `,
      ),
    );

    const generatedKeys = dates.map(toDateKey);
    const rows = generatedKeys.length
      ? await prisma.$queryRaw<any[]>(
          Prisma.sql`
            SELECT *
            FROM CA_Cronogramas
            WHERE CroStatus = 'A'
              AND CroTurma = ${input.turmaId}
              AND CroDisciplina = ${input.disciplinaId}
              AND CroSequencia = ${input.sequencia}
              AND DATE(CroDataAula) IN (${Prisma.join(generatedKeys)})
            ORDER BY CroDataAula ASC, CroCodigo ASC
          `,
        )
      : [];

    return {
      message: "Cronograma gerado com sucesso.",
      generated: rows.length,
      rows: this.hydrateRows(rows, [turma], [disciplina], [educador]),
    };
  }

  async list(filters: CronogramaFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(Math.max(1, filters.limit || 10), 100);
    const { whereSql } = buildListWhere(filters);
    const offset = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      prisma.$queryRaw<any[]>(
        Prisma.sql`
          SELECT *
          FROM CA_Cronogramas
          WHERE ${whereSql}
          ORDER BY CroDataAula ASC, CroCodigo ASC
          LIMIT ${limit} OFFSET ${offset}
        `,
      ),
      prisma.$queryRaw<Array<{ total: bigint | number }>>(
        Prisma.sql`
          SELECT COUNT(*) AS total
          FROM CA_Cronogramas
          WHERE ${whereSql}
        `,
      ),
    ]);

    const [turmas, disciplinas, educadores] = await this.loadLookups(rows);
    const totalCount = Number(total[0]?.total ?? 0);

    return {
      data: this.hydrateRows(rows, turmas, disciplinas, educadores),
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
    };
  }

  async updateEducador(id: number, educadorId: number) {
    const educador = await prisma.cA_Educadores.findUnique({
      where: { EducCodigo: educadorId },
      select: { EducCodigo: true, EducNome: true },
    });
    if (!educador) throw new Error("Professor nao encontrado.");

    await prisma.$executeRaw`
      UPDATE CA_Cronogramas
      SET CroEducador = ${educadorId}, CroDataAlteracao = ${new Date()}
      WHERE CroCodigo = ${id}
    `;

    const rows = await prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT * FROM CA_Cronogramas WHERE CroCodigo = ${id} LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new Error("Cronograma nao encontrado.");

    const [turmas, disciplinas] = await Promise.all([
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: row.CroTurma },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_Disciplinas.findMany({
        where: { DisCodigo: row.CroDisciplina },
        select: { DisCodigo: true, DisDescricao: true },
      }),
    ]);

    return this.hydrateRows([row], turmas, disciplinas, [educador])[0];
  }

  private async loadLookups(rows: any[]) {
    const turmaIds = [...new Set(rows.map((row) => row.CroTurma))] as number[];
    const disciplinaIds = [...new Set(rows.map((row) => row.CroDisciplina))] as number[];
    const educadorIds = [...new Set(rows.map((row) => row.CroEducador))] as number[];

    return Promise.all([
      turmaIds.length
        ? prisma.cA_Turmas.findMany({
            where: { TurCodigo: { in: turmaIds } },
            select: { TurCodigo: true, TurNome: true },
          })
        : [],
      disciplinaIds.length
        ? prisma.cA_Disciplinas.findMany({
            where: { DisCodigo: { in: disciplinaIds } },
            select: { DisCodigo: true, DisDescricao: true },
          })
        : [],
      educadorIds.length
        ? prisma.cA_Educadores.findMany({
            where: { EducCodigo: { in: educadorIds } },
            select: { EducCodigo: true, EducNome: true },
          })
        : [],
    ]);
  }

  private hydrateRows(rows: any[], turmas: any[], disciplinas: any[], educadores: any[]) {
    const turmaMap = new Map(turmas.map((turma) => [turma.TurCodigo, turma.TurNome || ""]));
    const disciplinaMap = new Map(disciplinas.map((disciplina) => [disciplina.DisCodigo, disciplina.DisDescricao || ""]));
    const educadorMap = new Map(educadores.map((educador) => [educador.EducCodigo, educador.EducNome || ""]));

    return rows.map((row) => ({
      codigo: row.CroCodigo,
      dataAula: formatDateBr(row.CroDataAula),
      dataAulaIso: toDateKey(row.CroDataAula),
      sequencia: row.CroSequencia,
      disciplinaId: row.CroDisciplina,
      disciplina: disciplinaMap.get(row.CroDisciplina) || `Disciplina ${row.CroDisciplina}`,
      educadorId: row.CroEducador,
      professor: educadorMap.get(row.CroEducador) || `Professor ${row.CroEducador}`,
      turmaId: row.CroTurma,
      turma: turmaMap.get(row.CroTurma) || `Turma ${row.CroTurma}`,
      quantidade: row.CroQuantidade,
    }));
  }
}
