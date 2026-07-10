import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class PresencaService {
  async getEstatisticasPresencaJovemFiltros() {
    const [situacoes, unidades] = await Promise.all([
      prisma.cA_SituacaoAprendiz.findMany({
        select: { StaCodigo: true, StaDescricao: true },
        orderBy: { StaDescricao: "asc" },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        select: { ParUniCodigo: true, ParUniDescricao: true },
        orderBy: { ParUniDescricao: "asc" },
      }),
    ]);

    return {
      situacoes: situacoes.filter((situacao) => situacao.StaDescricao),
      unidades,
    };
  }

  async getEstatisticasPresencaJovem(statusId?: number, unidadeParceiroId?: number) {
    const unitStudentIds = unidadeParceiroId
      ? [
          ...new Set(
            (
              await prisma.cA_AlocacaoAprendiz.findMany({
                where: { ALAUnidadeParceiro: unidadeParceiroId },
                select: { ALAAprendiz: true },
              })
            ).map((allocation) => allocation.ALAAprendiz)
          ),
        ]
      : undefined;

    if (unitStudentIds?.length === 0) return [];

    const students = await prisma.cA_Aprendiz.findMany({
      where: {
        ...(statusId ? { Apr_Situacao: BigInt(statusId) } : {}),
        ...(unitStudentIds ? { Apr_Codigo: { in: unitStudentIds.map(BigInt) } } : {}),
      },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
        Apr_Situacao: true,
        Apr_InicioAprendizagem: true,
        Apr_PrevFimAprendizagem: true,
      },
      orderBy: { Apr_Codigo: "asc" },
    });

    if (students.length === 0) return [];

    const studentIds = students.map((student) => Number(student.Apr_Codigo));
    const [allocations, attendanceRows, situations, units] = await Promise.all([
      prisma.cA_AlocacaoAprendiz.findMany({
        where: {
          ...(unidadeParceiroId ? { ALAUnidadeParceiro: unidadeParceiroId } : {}),
          ...(statusId || unidadeParceiroId ? { ALAAprendiz: { in: studentIds } } : {}),
        },
        select: {
          ALAAprendiz: true,
          ALAUnidadeParceiro: true,
          ALAOrdem: true,
        },
        orderBy: { ALAOrdem: "desc" },
      }),
      prisma.$queryRaw<
      Array<{
        codigo: number;
        faltas: bigint | number | null;
        faltasJustificadas: bigint | number | null;
        total: bigint | number | null;
        aulasCursadas: bigint | number | null;
      }>
      >(Prisma.sql`
      SELECT
        AdiCodAprendiz AS codigo,
        COUNT(*) AS total,
        SUM(CASE WHEN AdiDataAula <= CURRENT_DATE() THEN 1 ELSE 0 END) AS aulasCursadas,
        SUM(CASE WHEN AdiDataAula <= CURRENT_DATE() AND AdiPresenca = 'F' THEN 1 ELSE 0 END) AS faltas,
        SUM(CASE WHEN AdiDataAula <= CURRENT_DATE() AND AdiPresenca = 'J' THEN 1 ELSE 0 END) AS faltasJustificadas
      FROM CA_AulasDisciplinasAprendiz
      GROUP BY AdiCodAprendiz
      `),
      prisma.cA_SituacaoAprendiz.findMany({
        select: { StaCodigo: true, StaDescricao: true },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        select: { ParUniCodigo: true, ParUniDescricao: true },
      }),
    ]);

    const latestUnitByStudent = new Map<number, number>();
    for (const allocation of allocations) {
      if (!latestUnitByStudent.has(allocation.ALAAprendiz)) {
        latestUnitByStudent.set(allocation.ALAAprendiz, allocation.ALAUnidadeParceiro);
      }
    }
    const attendanceByStudent = new Map(attendanceRows.map((row) => [Number(row.codigo), row]));
    const situationMap = new Map(situations.map((situation) => [situation.StaCodigo, situation.StaDescricao || ""]));
    const unitMap = new Map(units.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao || ""]));

    return students.map((student) => {
      const attendance = attendanceByStudent.get(Number(student.Apr_Codigo));
      const total = Number(attendance?.total ?? 0);
      const aulasCursadas = Number(attendance?.aulasCursadas ?? 0);
      const faltas = Number(attendance?.faltas ?? 0);
      const faltasJustificadas = Number(attendance?.faltasJustificadas ?? 0);
      const presenca = Math.max(0, aulasCursadas - faltas - faltasJustificadas);
      const unitId = latestUnitByStudent.get(Number(student.Apr_Codigo));

      return {
        codigo: Number(student.Apr_Codigo),
        nome: student.Apr_Nome || "",
        unidadeParceiro: unitId ? unitMap.get(unitId) || "" : "",
        status: student.Apr_Situacao ? situationMap.get(Number(student.Apr_Situacao)) || "" : "",
        inicioAprendizagem: student.Apr_InicioAprendizagem,
        previsaoFimAprendizagem: student.Apr_PrevFimAprendizagem,
        faltas,
        faltasJustificadas,
        aCursar: Math.max(0, total - aulasCursadas),
        total,
        presenca,
        aulasCursadas,
        percentual: aulasCursadas > 0 ? (presenca / aulasCursadas) * 100 : 0,
      };
    });
  }
  // ─── 1. Presença por Data/Turma ───────────────────────────────────────────
  async getPresencaByData(turmaId: number, date: Date) {
    const [scheduledSessions, turma, allocations, attendance] = await Promise.all([
      prisma.cA_AulasDisciplinasTurmaProf.findMany({
        where: { ADPTurma: turmaId, ADPDataAula: date },
        orderBy: { ADPOrdemAula: "asc" },
      }),
      prisma.cA_Turmas.findUnique({
        where: { TurCodigo: turmaId },
        select: { TurNome: true },
      }),
      prisma.cA_AlocacaoAprendiz.findMany({
        where: {
          ALATurma: turmaId,
          ALAStatus: "A",
          AND: [
            {
              OR: [
                { ALADataInicio: null },
                { ALADataInicio: { lte: date } },
              ],
            },
            {
              OR: [
                { ALADataTermino: { gte: date } },
                { ALADataTermino: null, ALADataPrevTermino: null },
                { ALADataTermino: null, ALADataPrevTermino: { gte: date } },
              ],
            },
          ],
        },
        select: {
          ALAAprendiz: true,
          ALAUnidadeParceiro: true,
          ALAAreaAtuacao: true,
          ALAOrdem: true,
        },
        orderBy: { ALAOrdem: "desc" },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: { AdiTurma: turmaId, AdiDataAula: date },
        orderBy: [
          { AdiDisciplina: "asc" },
          { AdiEducador: "asc" },
          { AdiCodAprendiz: "asc" },
        ],
      }),
    ]);

    const allocationByStudent = new Map<
      number,
      { unitId: number; areaId: number | null }
    >();
    for (const allocation of allocations) {
      if (!allocationByStudent.has(allocation.ALAAprendiz)) {
        allocationByStudent.set(allocation.ALAAprendiz, {
          unitId: allocation.ALAUnidadeParceiro,
          areaId: allocation.ALAAreaAtuacao,
        });
      }
    }

    const studentIds = [...allocationByStudent.keys()];
    const fallbackSessionMap = new Map<string, { disciplinaId: number; educadorId: number }>();
    for (const record of attendance) {
      const key = `${record.AdiDisciplina}-${record.AdiEducador}`;
      if (!fallbackSessionMap.has(key)) {
        fallbackSessionMap.set(key, {
          disciplinaId: record.AdiDisciplina,
          educadorId: record.AdiEducador,
        });
      }
    }

    const sessions = scheduledSessions.length
      ? scheduledSessions.map((session) => ({
          ordem: session.ADPOrdemAula,
          disciplinaId: session.ADPDisciplina,
          educadorId: session.ADPprofessor,
          conteudo: session.ADPConteudoLecionado || "",
          recursos: session.ADPRecursosUsados || "",
          observacoes: session.ADPObservacoes || "",
        }))
      : [...fallbackSessionMap.values()].map((session, index) => ({
          ordem: index + 1,
          disciplinaId: session.disciplinaId,
          educadorId: session.educadorId,
          conteudo: "",
          recursos: "",
          observacoes: "",
        }));

    const discIds = [...new Set(sessions.map((s) => s.disciplinaId))];
    const unitIds = [...new Set([...allocationByStudent.values()].map((a) => a.unitId))];
    const rawAreaIds = [
      ...new Set(
        [...allocationByStudent.values()]
          .map((a) => a.areaId)
          .filter((areaId): areaId is number => areaId != null)
      ),
    ];

    const [students, disciplinas, partnerUnits] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map(id => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true, Apr_AreaAtuacao: true },
        orderBy: { Apr_Nome: "asc" },
      }),
      prisma.cA_Disciplinas.findMany({
        where: { DisCodigo: { in: discIds } },
        select: { DisCodigo: true, DisDescricao: true },
      }),
      unitIds.length
        ? prisma.cA_ParceirosUnidade.findMany({
            where: { ParUniCodigo: { in: unitIds } },
            select: { ParUniCodigo: true, ParUniDescricao: true },
          })
        : Promise.resolve([]),
    ]);

    const studentAreaIds = students
      .map((student) => student.Apr_AreaAtuacao)
      .filter((areaId): areaId is number => areaId != null)
      .map((areaId) => Number(areaId));
    const areaIds = [...new Set([...rawAreaIds, ...studentAreaIds])];
    const areas = areaIds.length
      ? await prisma.cA_AreaAtuacao.findMany({
          where: { AreaCodigo: { in: areaIds } },
          select: { AreaCodigo: true, AreaDescricao: true },
        })
      : [];

    const discMap = new Map(disciplinas.map((d) => [d.DisCodigo, d.DisDescricao]));
    const unitMap = new Map(partnerUnits.map((u) => [u.ParUniCodigo, u.ParUniDescricao]));
    const areaMap = new Map(areas.map((a) => [a.AreaCodigo, a.AreaDescricao]));

    // studentId -> disciplina/educador -> presenca
    const attMap = new Map<number, Map<string, string>>();
    for (const a of attendance) {
      if (!attMap.has(a.AdiCodAprendiz)) attMap.set(a.AdiCodAprendiz, new Map());
      attMap.get(a.AdiCodAprendiz)!.set(`${a.AdiDisciplina}-${a.AdiEducador}`, a.AdiPresenca || "");
    }

    return {
      sessions: sessions.map((s) => ({
        ordem: s.ordem,
        disciplinaId: s.disciplinaId,
        disciplina: discMap.get(s.disciplinaId) || "",
        conteudo: s.conteudo,
        recursos: s.recursos,
        observacoes: s.observacoes,
      })),
      students: students.map((s) => {
        const studentId = Number(s.Apr_Codigo);
        const allocation = allocationByStudent.get(studentId);
        const unitName = allocation ? unitMap.get(allocation.unitId) || "" : "";
        const areaId = allocation?.areaId ?? (s.Apr_AreaAtuacao != null ? Number(s.Apr_AreaAtuacao) : null);

        return {
          IdAluno: studentId,
          NomeJovem: s.Apr_Nome,
          Turma: turma?.TurNome || "",
          Parceiro: unitName,
          UnidadeParceiro: unitName,
          AreaAtuacao: areaId ? areaMap.get(areaId) || "" : "",
          presencas: sessions.map((sess) => ({
            ordem: sess.ordem,
            disciplinaId: sess.disciplinaId,
            presenca: attMap.get(studentId)?.get(`${sess.disciplinaId}-${sess.educadorId}`) || null,
          })),
        };
      }),
    };
  }

  // ─── 2. Presença Turma por Período ────────────────────────────────────────
  async getPresencaTurmaPeriodo(turmaId: number, startDate: Date, endDate: Date) {
    const matriculados = await prisma.cA_CapacitacaoAprendiz.findMany({
      where: { CapTurma: turmaId, CapStatus: "A" },
      select: { CapAprendiz: true },
    });
    const studentIds = matriculados.map((m) => m.CapAprendiz);

    const [totalAulas, students, attendance] = await Promise.all([
      prisma.cA_AulasDisciplinasTurmaProf.count({
        where: { ADPTurma: turmaId, ADPDataAula: { gte: startDate, lte: endDate } },
      }),
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map(id => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Nome: "asc" },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiTurma: turmaId,
          AdiCodAprendiz: { in: studentIds },
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: { AdiCodAprendiz: true, AdiPresenca: true },
      }),
    ]);

    const countMap = new Map<number, { P: number; F: number; J: number; outros: number }>();
    for (const a of attendance) {
      if (!countMap.has(a.AdiCodAprendiz))
        countMap.set(a.AdiCodAprendiz, { P: 0, F: 0, J: 0, outros: 0 });
      const c = countMap.get(a.AdiCodAprendiz)!;
      const p = (a.AdiPresenca || "").toUpperCase();
      if (p === "P") c.P++;
      else if (p === "F") c.F++;
      else if (p === "J") c.J++;
      else c.outros++;
    }

    return {
      totalAulas,
      students: students.map((s) => {
        const c = countMap.get(Number(s.Apr_Codigo)) || { P: 0, F: 0, J: 0, outros: 0 };
        return {
          IdAluno: Number(s.Apr_Codigo),
          NomeJovem: s.Apr_Nome,
          presencas: c.P,
          faltas: c.F,
          justificadas: c.J,
          total: c.P + c.F + c.J + c.outros,
          percentual: totalAulas > 0 ? Math.round((c.P / totalAulas) * 100) : 0,
        };
      }),
    };
  }

  // ─── 3. Total Aulas Turma por Período ─────────────────────────────────────
  async getMatrizPresencaTurmaPeriodo(turmaId: number, startDate: Date, endDate: Date) {
    const [matriculados, attendance] = await Promise.all([
      prisma.cA_CapacitacaoAprendiz.findMany({
        where: { CapTurma: turmaId, CapStatus: "A" },
        select: { CapAprendiz: true },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiTurma: turmaId,
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AdiCodAprendiz: true,
          AdiDataAula: true,
          AdiDisciplina: true,
          AdiEducador: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
        orderBy: [
          { AdiDataAula: "asc" },
          { AdiDisciplina: "asc" },
          { AdiEducador: "asc" },
          { AdiCodAprendiz: "asc" },
        ],
      }),
    ]);

    const studentIds = [
      ...new Set([
        ...matriculados.map((m) => m.CapAprendiz),
        ...attendance.map((a) => a.AdiCodAprendiz),
      ]),
    ];

    if (studentIds.length === 0) {
      return { kind: "period-matrix", columns: [], students: [] };
    }

    const [students, allocations] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Codigo: "asc" },
      }),
      prisma.cA_AlocacaoAprendiz.findMany({
        where: { ALAAprendiz: { in: studentIds } },
        select: { ALAAprendiz: true, ALAUnidadeParceiro: true },
        orderBy: { ALAOrdem: "desc" },
      }),
    ]);

    const allocationMap = new Map<number, number>();
    for (const allocation of allocations) {
      if (!allocationMap.has(allocation.ALAAprendiz)) {
        allocationMap.set(allocation.ALAAprendiz, allocation.ALAUnidadeParceiro);
      }
    }

    const unitIds = [...new Set([...allocationMap.values()])];
    const partnerUnits = unitIds.length
      ? await prisma.cA_ParceirosUnidade.findMany({
          where: { ParUniCodigo: { in: unitIds } },
          select: { ParUniCodigo: true, ParUniDescricao: true },
        })
      : [];
    const unitMap = new Map(partnerUnits.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao]));

    const toDateKey = (date: Date) => date.toISOString().substring(0, 10);
    const toShortLabel = (dateKey: string) => {
      const [, month, day] = dateKey.split("-");
      return `${day}/${month}`;
    };
    const normalizePresence = (presenca?: string | null, presencaTarde?: string | null) => {
      const primary = presenca?.trim() || "";
      const secondary = presencaTarde?.trim() || "";
      if ((!primary || primary === ".") && secondary && secondary !== ".") return secondary;
      return primary || secondary || ".";
    };

    const sessionMap = new Map<string, { dateKey: string; disciplina: number; educador: number }>();

    for (const record of attendance) {
      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          dateKey,
          disciplina: record.AdiDisciplina,
          educador: record.AdiEducador,
        });
      }
    }

    const sessions = [...sessionMap.entries()]
      .map(([sessionKey, session]) => ({ sessionKey, ...session }))
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
        if (a.disciplina !== b.disciplina) return a.disciplina - b.disciplina;
        return a.educador - b.educador;
      });

    const sessionKeyToColumnKey = new Map<string, string>();
    const countByDate = new Map<string, number>();
    const columns = sessions.map((session) => {
      const ordem = (countByDate.get(session.dateKey) || 0) + 1;
      countByDate.set(session.dateKey, ordem);
      const key = `${session.dateKey}-${ordem}`;
      sessionKeyToColumnKey.set(session.sessionKey, key);

      return {
        key,
        label: `${toShortLabel(session.dateKey)} encs${ordem}`,
        date: session.dateKey,
        ordem,
      };
    });

    const rowsById = new Map<
      number,
      { IdAluno: number; NomeJovem: string; UnidadeParceiro: string; presencas: Record<string, string> }
    >();

    for (const student of students) {
      const studentId = Number(student.Apr_Codigo);
      const unitId = allocationMap.get(studentId);
      rowsById.set(studentId, {
        IdAluno: studentId,
        NomeJovem: student.Apr_Nome || "",
        UnidadeParceiro: unitId ? unitMap.get(unitId) || "" : "",
        presencas: {},
      });
    }

    for (const record of attendance) {
      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      const columnKey = sessionKeyToColumnKey.get(sessionKey);
      const row = rowsById.get(record.AdiCodAprendiz);
      if (columnKey && row) {
        row.presencas[columnKey] = normalizePresence(record.AdiPresenca, record.AdiPresencaTarde);
      }
    }

    return {
      kind: "period-matrix",
      columns,
      students: [...rowsById.values()].sort((a, b) => a.IdAluno - b.IdAluno),
    };
  }

  async getTotalAulasTurmaPeriodo(turmaId: number, startDate: Date, endDate: Date) {
    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: {
        ALATurma: turmaId,
        AND: [
          { OR: [{ ALADataInicio: null }, { ALADataInicio: { lte: endDate } }] },
          {
            OR: [
              { ALADataTermino: { gte: startDate } },
              { ALADataTermino: null, ALADataPrevTermino: null },
              { ALADataTermino: null, ALADataPrevTermino: { gte: startDate } },
            ],
          },
        ],
      },
      select: {
        ALAAprendiz: true,
        ALAUnidadeParceiro: true,
        ALADataInicio: true,
        ALADataTermino: true,
        ALADataPrevTermino: true,
        ALAOrdem: true,
      },
      orderBy: [
        { ALAAprendiz: "asc" },
        { ALAOrdem: "desc" },
      ],
    });

    const allocationMap = new Map<
      number,
      { unitId: number; start: Date | null; end: Date | null }
    >();
    for (const allocation of allocations) {
      if (!allocationMap.has(allocation.ALAAprendiz)) {
        allocationMap.set(allocation.ALAAprendiz, {
          unitId: allocation.ALAUnidadeParceiro,
          start: allocation.ALADataInicio,
          end: allocation.ALADataTermino || allocation.ALADataPrevTermino,
        });
      }
    }

    const studentIds = [...allocationMap.keys()];
    if (studentIds.length === 0) {
      return { kind: "total-periodo-turma", columns: [], students: [] };
    }

    const [students, partnerUnits, attendance] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Codigo: "asc" },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigo: { in: [...new Set([...allocationMap.values()].map((a) => a.unitId))] } },
        select: { ParUniCodigo: true, ParUniDescricao: true },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiTurma: turmaId,
          AdiCodAprendiz: { in: studentIds },
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AdiCodAprendiz: true,
          AdiDataAula: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
        orderBy: [
          { AdiCodAprendiz: "asc" },
          { AdiDataAula: "asc" },
        ],
      }),
    ]);

    const toMonthKey = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    };
    const toMonthLabel = (monthKey: string) => {
      const [year, month] = monthKey.split("-");
      return `${Number(month)}/${year}`;
    };
    const dateInsideAllocation = (
      date: Date,
      allocation: { start: Date | null; end: Date | null }
    ) => {
      if (allocation.start && date < allocation.start) return false;
      if (allocation.end && date > allocation.end) return false;
      return true;
    };
    const classifyPresence = (value?: string | null) => {
      const normalized = String(value ?? "").trim().toUpperCase();
      if (!normalized) return null;
      if (normalized === "." || normalized === "P") return "P";
      if (normalized === "F") return "F";
      return "A";
    };

    const monthKeys = new Set<string>();
    const totalsByStudent = new Map<
      number,
      Record<string, { aulas: number; presencas: number; faltas: number }>
    >();

    for (const record of attendance) {
      const allocation = allocationMap.get(record.AdiCodAprendiz);
      if (!allocation || !dateInsideAllocation(record.AdiDataAula, allocation)) continue;

      const monthKey = toMonthKey(record.AdiDataAula);
      monthKeys.add(monthKey);

      if (!totalsByStudent.has(record.AdiCodAprendiz)) totalsByStudent.set(record.AdiCodAprendiz, {});
      const studentTotals = totalsByStudent.get(record.AdiCodAprendiz)!;
      if (!studentTotals[monthKey]) {
        studentTotals[monthKey] = { aulas: 0, presencas: 0, faltas: 0 };
      }

      for (const slot of [record.AdiPresenca, record.AdiPresencaTarde]) {
        const status = classifyPresence(slot);
        if (!status) continue;

        studentTotals[monthKey].aulas++;
        if (status === "P") studentTotals[monthKey].presencas++;
        if (status === "F") studentTotals[monthKey].faltas++;
      }
    }

    const columns = [...monthKeys].sort().map((monthKey) => ({
      key: monthKey,
      label: toMonthLabel(monthKey),
    }));
    const unitMap = new Map(partnerUnits.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao || ""]));

    return {
      kind: "total-periodo-turma",
      columns,
      students: students.map((student) => {
        const studentId = Number(student.Apr_Codigo);
        const allocation = allocationMap.get(studentId);
        return {
          IdAluno: studentId,
          NomeJovem: student.Apr_Nome || "",
          UnidadeParceiro: allocation ? unitMap.get(allocation.unitId) || "" : "",
          totais: totalsByStudent.get(studentId) || {},
        };
      }),
    };
  }

  async getTotalAulasTurmaPeriodoCapacitacao(turmaId: number, startDate: Date, endDate: Date) {
    const capacitacoes = await prisma.cA_CapacitacaoAprendiz.findMany({
      where: {
        CapTurma: turmaId,
        CapDataInicio: { lte: endDate },
      },
      select: {
        CapAprendiz: true,
        CapDataInicio: true,
        CapDataTermino: true,
        CapDataPrevTermino: true,
      },
      orderBy: { CapAprendiz: "asc" },
    });

    const isOpenEndedDate = (date?: Date | null) =>
      !date || date.getUTCFullYear() <= 1900;
    const getEffectiveEndDate = (end?: Date | null, prevEnd?: Date | null) =>
      isOpenEndedDate(end) ? prevEnd || null : end || null;

    const capacitacaoMap = new Map<number, { start: Date; end: Date | null }>();
    for (const capacitacao of capacitacoes) {
      const effectiveEnd = getEffectiveEndDate(
        capacitacao.CapDataTermino,
        capacitacao.CapDataPrevTermino
      );
      if (effectiveEnd && effectiveEnd < startDate) continue;

      if (!capacitacaoMap.has(capacitacao.CapAprendiz)) {
        capacitacaoMap.set(capacitacao.CapAprendiz, {
          start: capacitacao.CapDataInicio,
          end: effectiveEnd,
        });
      }
    }

    const studentIds = [...capacitacaoMap.keys()];
    if (studentIds.length === 0) {
      return { kind: "total-periodo-turma", columns: [], students: [] };
    }

    const [students, attendance] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Codigo: "asc" },
      }),
      prisma.cA_AulasCapacitacaoAprendiz.findMany({
        where: {
          AcpTurma: turmaId,
          AcpAprendiz: { in: studentIds },
          AcpDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AcpAprendiz: true,
          AcpDataAula: true,
          AcpPresenca: true,
        },
        orderBy: [
          { AcpAprendiz: "asc" },
          { AcpDataAula: "asc" },
        ],
      }),
    ]);

    const toMonthKey = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    };
    const toMonthLabel = (monthKey: string) => {
      const [year, month] = monthKey.split("-");
      return `${Number(month)}/${year}`;
    };
    const dateInsideCapacitacao = (
      date: Date,
      capacitacao: { start: Date; end: Date | null }
    ) => {
      if (date < capacitacao.start) return false;
      if (capacitacao.end && date > capacitacao.end) return false;
      return true;
    };
    const normalizePresence = (value?: string | null) => String(value ?? "").trim().toUpperCase();

    const monthKeys = new Set<string>();
    const totalsByStudent = new Map<
      number,
      Record<string, { aulas: number; presencas: number; faltas: number }>
    >();

    for (const record of attendance) {
      const capacitacao = capacitacaoMap.get(record.AcpAprendiz);
      if (!capacitacao || !dateInsideCapacitacao(record.AcpDataAula, capacitacao)) continue;

      const monthKey = toMonthKey(record.AcpDataAula);
      monthKeys.add(monthKey);

      if (!totalsByStudent.has(record.AcpAprendiz)) totalsByStudent.set(record.AcpAprendiz, {});
      const studentTotals = totalsByStudent.get(record.AcpAprendiz)!;
      if (!studentTotals[monthKey]) {
        studentTotals[monthKey] = { aulas: 0, presencas: 0, faltas: 0 };
      }

      const status = normalizePresence(record.AcpPresenca);
      studentTotals[monthKey].aulas++;
      if (status === "P" || status === ".") studentTotals[monthKey].presencas++;
      if (status === "F") studentTotals[monthKey].faltas++;
    }

    const columns = [...monthKeys].sort().map((monthKey) => ({
      key: monthKey,
      label: toMonthLabel(monthKey),
    }));

    return {
      kind: "total-periodo-turma",
      columns,
      students: students.map((student) => {
        const studentId = Number(student.Apr_Codigo);
        return {
          IdAluno: studentId,
          NomeJovem: student.Apr_Nome || "",
          UnidadeParceiro: "",
          totais: totalsByStudent.get(studentId) || {},
        };
      }),
    };
  }

  // ─── 4. Conteúdos Lecionados ───────────────────────────────────────────────
  async getConteudosLecionados(turmaId: number, startDate: Date, endDate: Date) {
    const sessions = await prisma.cA_AulasDisciplinasTurmaProf.findMany({
      where: { ADPTurma: turmaId, ADPDataAula: { gte: startDate, lte: endDate } },
      orderBy: [{ ADPDataAula: "asc" }, { ADPOrdemAula: "asc" }],
    });

    const discIds = [...new Set(sessions.map((s) => s.ADPDisciplina))];
    const disciplinas = await prisma.cA_Disciplinas.findMany({
      where: { DisCodigo: { in: discIds } },
      select: { DisCodigo: true, DisDescricao: true },
    });
    const discMap = new Map(disciplinas.map((d) => [d.DisCodigo, d.DisDescricao]));

    return sessions.map((s) => ({
      data: s.ADPDataAula,
      ordem: s.ADPOrdemAula,
      disciplina: discMap.get(s.ADPDisciplina) || "",
      conteudo: s.ADPConteudoLecionado || "",
      recursos: s.ADPRecursosUsados || "",
      observacoes: s.ADPObservacoes || "",
    }));
  }

  // ─── 5. Presença Parceiro por Período ─────────────────────────────────────
  async getPresencaParceiroPeriodo(parceiroId: number, startDate: Date, endDate: Date) {
    const units = await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigoParceiro: parceiroId },
      select: { ParUniCodigo: true, ParUniDescricao: true },
    });
    const unitIds = units.map((u) => u.ParUniCodigo);
    const unitMap = new Map(units.map((u) => [u.ParUniCodigo, u.ParUniDescricao]));

    if (unitIds.length === 0) {
      return { kind: "period-matrix", columns: [], students: [] };
    }

    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: {
        ALAUnidadeParceiro: { in: unitIds },
        AND: [
          { OR: [{ ALADataInicio: null }, { ALADataInicio: { lte: endDate } }] },
          {
            OR: [
              { ALADataTermino: { gte: startDate } },
              { ALADataTermino: null, ALADataPrevTermino: null },
              { ALADataTermino: null, ALADataPrevTermino: { gte: startDate } },
            ],
          },
        ],
      },
      select: {
        ALAAprendiz: true,
        ALATurma: true,
        ALAUnidadeParceiro: true,
        ALADataInicio: true,
        ALADataTermino: true,
        ALADataPrevTermino: true,
        ALAOrdem: true,
      },
      orderBy: [
        { ALAAprendiz: "asc" },
        { ALATurma: "asc" },
        { ALAOrdem: "desc" },
      ],
    });

    if (allocations.length === 0) {
      return { kind: "period-matrix", columns: [], students: [] };
    }

    const allocationRows = new Map<
      string,
      {
        key: string;
        studentId: number;
        turmaId: number;
        unitId: number;
        start: Date | null;
        end: Date | null;
      }
    >();

    for (const allocation of allocations) {
      const key = `${allocation.ALAAprendiz}-${allocation.ALATurma}-${allocation.ALAUnidadeParceiro}`;
      if (!allocationRows.has(key)) {
        allocationRows.set(key, {
          key,
          studentId: allocation.ALAAprendiz,
          turmaId: allocation.ALATurma,
          unitId: allocation.ALAUnidadeParceiro,
          start: allocation.ALADataInicio,
          end: allocation.ALADataTermino || allocation.ALADataPrevTermino,
        });
      }
    }

    const rows = [...allocationRows.values()];
    const studentIds = [...new Set(rows.map((row) => row.studentId))];
    const turmaIds = [...new Set(rows.map((row) => row.turmaId))];

    const [students, turmas, attendance] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map(id => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Nome: "asc" },
      }),
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: turmaIds } },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiCodAprendiz: { in: studentIds },
          AdiTurma: { in: turmaIds },
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AdiCodAprendiz: true,
          AdiTurma: true,
          AdiDataAula: true,
          AdiDisciplina: true,
          AdiEducador: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
        orderBy: [
          { AdiDataAula: "asc" },
          { AdiDisciplina: "asc" },
          { AdiEducador: "asc" },
          { AdiCodAprendiz: "asc" },
        ],
      }),
    ]);

    const toDateKey = (date: Date) => date.toISOString().substring(0, 10);
    const toShortLabel = (dateKey: string) => {
      const [, month, day] = dateKey.split("-");
      return `${day}-${month}`;
    };
    const normalizePresence = (presenca?: string | null, presencaTarde?: string | null) => {
      const primary = presenca?.trim() || "";
      const secondary = presencaTarde?.trim() || "";
      if ((!primary || primary === ".") && secondary && secondary !== ".") return secondary;
      return primary || secondary || ".";
    };
    const dateInsideAllocation = (
      date: Date,
      allocation: { start: Date | null; end: Date | null }
    ) => {
      if (allocation.start && date < allocation.start) return false;
      if (allocation.end && date > allocation.end) return false;
      return true;
    };

    const rowsByStudentTurma = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.studentId}-${row.turmaId}`;
      const current = rowsByStudentTurma.get(key) || [];
      current.push(row);
      rowsByStudentTurma.set(key, current);
    }

    const relevantAttendance = attendance.filter((record) => {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      return possibleRows.some((row) => dateInsideAllocation(record.AdiDataAula, row));
    });

    const sessionMap = new Map<string, { dateKey: string; disciplina: number; educador: number }>();

    for (const record of relevantAttendance) {
      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          dateKey,
          disciplina: record.AdiDisciplina,
          educador: record.AdiEducador,
        });
      }
    }

    const sessions = [...sessionMap.entries()]
      .map(([sessionKey, session]) => ({ sessionKey, ...session }))
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
        if (a.disciplina !== b.disciplina) return a.disciplina - b.disciplina;
        return a.educador - b.educador;
      });

    const sessionKeyToColumnKey = new Map<string, string>();
    const countByDate = new Map<string, number>();
    const columns = sessions.map((session) => {
      const ordem = (countByDate.get(session.dateKey) || 0) + 1;
      countByDate.set(session.dateKey, ordem);
      const key = `${session.dateKey}-${ordem}`;
      sessionKeyToColumnKey.set(session.sessionKey, key);

      return {
        key,
        label: `${toShortLabel(session.dateKey)} encs${ordem}`,
        date: session.dateKey,
        ordem,
      };
    });

    const studentMap = new Map(students.map((student) => [Number(student.Apr_Codigo), student.Apr_Nome || ""]));
    const turmaMap = new Map(turmas.map((turma) => [turma.TurCodigo, turma.TurNome || ""]));
    const resultRows = new Map<
      string,
      {
        key: string;
        IdAluno: number;
        NomeJovem: string;
        UnidadeParceiro: string;
        Turma: string;
        presencas: Record<string, string>;
      }
    >();

    for (const row of rows) {
      resultRows.set(row.key, {
        key: row.key,
        IdAluno: row.studentId,
        NomeJovem: studentMap.get(row.studentId) || "",
        UnidadeParceiro: unitMap.get(row.unitId) || "",
        Turma: turmaMap.get(row.turmaId) || "",
        presencas: {},
      });
    }

    for (const record of relevantAttendance) {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      const row = possibleRows.find((item) => dateInsideAllocation(record.AdiDataAula, item));
      if (!row) continue;

      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      const columnKey = sessionKeyToColumnKey.get(sessionKey);
      const resultRow = resultRows.get(row.key);

      if (columnKey && resultRow) {
        resultRow.presencas[columnKey] = normalizePresence(record.AdiPresenca, record.AdiPresencaTarde);
      }
    }

    return {
      kind: "period-matrix",
      columns,
      students: [...resultRows.values()].sort((a, b) => {
        if (a.Turma !== b.Turma) return a.Turma.localeCompare(b.Turma, "pt-BR", { numeric: true });
        return a.IdAluno - b.IdAluno;
      }),
    };
  }

  // ─── 6. Total Aulas Parceiro por Período ──────────────────────────────────
  async getPresencaEmpresaPeriodo(parceiroId: number, startDate: Date, endDate: Date) {
    const matrix = await this.getPresencaParceiroPeriodo(parceiroId, startDate, endDate);
    const studentsById = new Map<number, (typeof matrix.students)[number]>();

    for (const student of matrix.students) {
      const presenceCount = Object.keys(student.presencas).length;
      if (presenceCount === 0) continue;

      const current = studentsById.get(student.IdAluno);
      if (!current || presenceCount > Object.keys(current.presencas).length) {
        studentsById.set(student.IdAluno, student);
      }
    }

    return {
      ...matrix,
      columns: matrix.columns.map((column) => ({
        ...column,
        label: column.label.replace(/^(\d{2})-(\d{2})/, "$1/$2"),
      })),
      students: [...studentsById.values()].sort((a, b) => a.IdAluno - b.IdAluno),
    };
  }

  async getTotalAulasParceiroPeriodo(parceiroId: number, startDate: Date, endDate: Date) {
    const units = await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigoParceiro: parceiroId },
      select: { ParUniCodigo: true, ParUniDescricao: true },
    });
    const unitIds = units.map((u) => u.ParUniCodigo);

    if (unitIds.length === 0) {
      return { kind: "total-periodo-turma", columns: [], students: [] };
    }

    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: {
        ALAUnidadeParceiro: { in: unitIds },
        AND: [
          { OR: [{ ALADataInicio: null }, { ALADataInicio: { lte: endDate } }] },
          {
            OR: [
              { ALADataTermino: { gte: startDate } },
              { ALADataTermino: null, ALADataPrevTermino: null },
              { ALADataTermino: null, ALADataPrevTermino: { gte: startDate } },
            ],
          },
        ],
      },
      select: {
        ALAAprendiz: true,
        ALATurma: true,
        ALAUnidadeParceiro: true,
        ALADataInicio: true,
        ALADataTermino: true,
        ALADataPrevTermino: true,
        ALAOrdem: true,
      },
      orderBy: [
        { ALAAprendiz: "asc" },
        { ALATurma: "asc" },
        { ALAOrdem: "desc" },
      ],
    });

    if (allocations.length === 0) {
      return { kind: "total-periodo-turma", columns: [], students: [] };
    }

    const allocationRows = new Map<
      string,
      {
        key: string;
        studentId: number;
        turmaId: number;
        unitId: number;
        start: Date | null;
        end: Date | null;
      }
    >();

    for (const allocation of allocations) {
      const key = `${allocation.ALAAprendiz}-${allocation.ALATurma}-${allocation.ALAUnidadeParceiro}`;
      if (!allocationRows.has(key)) {
        allocationRows.set(key, {
          key,
          studentId: allocation.ALAAprendiz,
          turmaId: allocation.ALATurma,
          unitId: allocation.ALAUnidadeParceiro,
          start: allocation.ALADataInicio,
          end: allocation.ALADataTermino || allocation.ALADataPrevTermino,
        });
      }
    }

    const rows = [...allocationRows.values()];
    const studentIds = [...new Set(rows.map((row) => row.studentId))];
    const turmaIds = [...new Set(rows.map((row) => row.turmaId))];

    const [students, attendance] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Codigo: "asc" },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiCodAprendiz: { in: studentIds },
          AdiTurma: { in: turmaIds },
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AdiCodAprendiz: true,
          AdiTurma: true,
          AdiDataAula: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
        orderBy: [
          { AdiCodAprendiz: "asc" },
          { AdiTurma: "asc" },
          { AdiDataAula: "asc" },
        ],
      }),
    ]);

    const toMonthKey = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    };
    const toMonthLabel = (monthKey: string) => {
      const [year, month] = monthKey.split("-");
      return `${Number(month)}/${year}`;
    };
    const dateInsideAllocation = (
      date: Date,
      allocation: { start: Date | null; end: Date | null }
    ) => {
      if (allocation.start && date < allocation.start) return false;
      if (allocation.end && date > allocation.end) return false;
      return true;
    };
    const classifyPresence = (value?: string | null) => {
      const normalized = String(value ?? "").trim().toUpperCase();
      if (!normalized) return null;
      if (normalized === "." || normalized === "P") return "P";
      if (normalized === "F") return "F";
      if (normalized === "J") return "J";
      return "A";
    };

    const rowsByStudentTurma = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.studentId}-${row.turmaId}`;
      const current = rowsByStudentTurma.get(key) || [];
      current.push(row);
      rowsByStudentTurma.set(key, current);
    }

    const monthKeys = new Set<string>();
    const totalsByStudentUnit = new Map<
      string,
      Record<string, { aulas: number; presencas: number; justificadas: number; faltas: number }>
    >();

    for (const record of attendance) {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      const allocation = possibleRows.find((row) => dateInsideAllocation(record.AdiDataAula, row));
      if (!allocation) continue;

      const rowKey = `${record.AdiCodAprendiz}-${allocation.unitId}`;
      const monthKey = toMonthKey(record.AdiDataAula);
      monthKeys.add(monthKey);

      if (!totalsByStudentUnit.has(rowKey)) totalsByStudentUnit.set(rowKey, {});
      const rowTotals = totalsByStudentUnit.get(rowKey)!;
      if (!rowTotals[monthKey]) {
        rowTotals[monthKey] = { aulas: 0, presencas: 0, justificadas: 0, faltas: 0 };
      }

      for (const slot of [record.AdiPresenca, record.AdiPresencaTarde]) {
        const status = classifyPresence(slot);
        if (!status) continue;

        rowTotals[monthKey].aulas++;
        if (status === "P") rowTotals[monthKey].presencas++;
        if (status === "J") rowTotals[monthKey].justificadas++;
        if (status === "F") rowTotals[monthKey].faltas++;
      }
    }

    const columns = [...monthKeys].sort().map((monthKey) => ({
      key: monthKey,
      label: toMonthLabel(monthKey),
    }));
    const studentMap = new Map(students.map((student) => [Number(student.Apr_Codigo), student.Apr_Nome || ""]));
    const unitMap = new Map(units.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao || ""]));
    const resultRows = new Map<string, { studentId: number; unitId: number }>();

    for (const row of rows) {
      const key = `${row.studentId}-${row.unitId}`;
      if (!resultRows.has(key)) {
        resultRows.set(key, { studentId: row.studentId, unitId: row.unitId });
      }
    }

    return {
      kind: "total-periodo-turma",
      columns,
      students: [...resultRows.entries()]
        .map(([key, row]) => ({
          IdAluno: row.studentId,
          NomeJovem: studentMap.get(row.studentId) || "",
          UnidadeParceiro: unitMap.get(row.unitId) || "",
          totais: totalsByStudentUnit.get(key) || {},
        }))
        .sort((a, b) => {
          if (a.UnidadeParceiro !== b.UnidadeParceiro) {
            return a.UnidadeParceiro.localeCompare(b.UnidadeParceiro, "pt-BR", { numeric: true });
          }
          return a.IdAluno - b.IdAluno;
        }),
    };
  }

  // ─── 7. Faltas por Parceiro no Período ────────────────────────────────────
  async getTotalAulasEmpresaPeriodo(parceiroId: number, startDate: Date, endDate: Date) {
    const result = await this.getTotalAulasParceiroPeriodo(parceiroId, startDate, endDate);

    return {
      ...result,
      students: result.students.filter((student) => Object.keys(student.totais).length > 0),
    };
  }

  async getFaltasParceiroPeriodoLegacy(startDate: Date, endDate: Date) {
    const absences = await prisma.cA_AulasDisciplinasAprendiz.findMany({
      where: { AdiDataAula: { gte: startDate, lte: endDate }, AdiPresenca: "F" },
      select: { AdiCodAprendiz: true },
    });

    const studentIds = [...new Set(absences.map((a) => a.AdiCodAprendiz))];
    if (studentIds.length === 0) return [];

    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: { ALAAprendiz: { in: studentIds } },
      select: { ALAAprendiz: true, ALAUnidadeParceiro: true },
      orderBy: { ALAOrdem: "desc" },
    });

    const allocationMap = new Map<number, number>();
    for (const a of allocations) {
      if (!allocationMap.has(a.ALAAprendiz))
        allocationMap.set(a.ALAAprendiz, a.ALAUnidadeParceiro);
    }

    const unitIds = [...new Set([...allocationMap.values()])];
    const units = await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigo: { in: unitIds } },
      select: { ParUniCodigo: true, ParUniDescricao: true, ParUniCodigoParceiro: true },
    });

    const parceiroIds = [...new Set(units.map((u) => u.ParUniCodigoParceiro))];
    const parceiros = await prisma.cA_Parceiros.findMany({
      where: { ParCodigo: { in: parceiroIds } },
      select: { ParCodigo: true, ParDescricao: true },
    });

    const unitMap = new Map(
      units.map((u) => [u.ParUniCodigo, { desc: u.ParUniDescricao, parceiroId: u.ParUniCodigoParceiro }])
    );
    const parceiroMap = new Map(parceiros.map((p) => [p.ParCodigo, p.ParDescricao]));

    const faltasMap = new Map<number, number>();
    for (const a of absences) {
      const unitId = allocationMap.get(a.AdiCodAprendiz);
      if (unitId) faltasMap.set(unitId, (faltasMap.get(unitId) || 0) + 1);
    }

    return [...faltasMap.entries()]
      .map(([unitId, faltas]) => {
        const unit = unitMap.get(unitId);
        return {
          unidadeId: unitId,
          unidade: unit?.desc || "",
          parceiro: unit ? (parceiroMap.get(unit.parceiroId) || "") : "",
          faltas,
        };
      })
      .sort((a, b) => b.faltas - a.faltas);
  }

  // ─── 8. Contagem de Faltas por Período ────────────────────────────────────
  async getFaltasParceiroPeriodo(startDate: Date, endDate: Date) {
    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: {
        AND: [
          { OR: [{ ALADataInicio: null }, { ALADataInicio: { lte: endDate } }] },
          {
            OR: [
              { ALADataTermino: { gte: startDate } },
              { ALADataTermino: null, ALADataPrevTermino: null },
              { ALADataTermino: null, ALADataPrevTermino: { gte: startDate } },
            ],
          },
        ],
      },
      select: {
        ALAAprendiz: true,
        ALATurma: true,
        ALAUnidadeParceiro: true,
        ALADataInicio: true,
        ALADataTermino: true,
        ALADataPrevTermino: true,
        ALAOrdem: true,
      },
      orderBy: [
        { ALAAprendiz: "asc" },
        { ALATurma: "asc" },
        { ALAOrdem: "desc" },
      ],
    });

    if (allocations.length === 0) {
      return { kind: "period-matrix", columns: [], students: [] };
    }

    const allocationRows = new Map<
      string,
      {
        key: string;
        studentId: number;
        turmaId: number;
        unitId: number;
        start: Date | null;
        end: Date | null;
      }
    >();

    for (const allocation of allocations) {
      const key = `${allocation.ALAAprendiz}-${allocation.ALATurma}-${allocation.ALAUnidadeParceiro}`;
      if (!allocationRows.has(key)) {
        allocationRows.set(key, {
          key,
          studentId: allocation.ALAAprendiz,
          turmaId: allocation.ALATurma,
          unitId: allocation.ALAUnidadeParceiro,
          start: allocation.ALADataInicio,
          end: allocation.ALADataTermino || allocation.ALADataPrevTermino,
        });
      }
    }

    const rows = [...allocationRows.values()];
    const studentIds = [...new Set(rows.map((row) => row.studentId))];
    const turmaIds = [...new Set(rows.map((row) => row.turmaId))];
    const unitIds = [...new Set(rows.map((row) => row.unitId))];

    const [students, units, turmas, disciplinas, attendance] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigo: { in: unitIds } },
        select: { ParUniCodigo: true, ParUniDescricao: true },
      }),
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: turmaIds } },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_Disciplinas.findMany({
        select: { DisCodigo: true, DisDescricao: true, DisAbreviatura: true },
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiCodAprendiz: { in: studentIds },
          AdiTurma: { in: turmaIds },
          AdiDataAula: { gte: startDate, lte: endDate },
          OR: [{ AdiPresenca: "F" }, { AdiPresencaTarde: "F" }],
        },
        select: {
          AdiCodAprendiz: true,
          AdiTurma: true,
          AdiDisciplina: true,
          AdiEducador: true,
          AdiDataAula: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
        orderBy: [
          { AdiDataAula: "asc" },
          { AdiDisciplina: "asc" },
          { AdiEducador: "asc" },
          { AdiCodAprendiz: "asc" },
        ],
      }),
    ]);

    const toDateKey = (date: Date) => date.toISOString().substring(0, 10);
    const toShortLabel = (dateKey: string) => {
      const [, month, day] = dateKey.split("-");
      return `${day}/${month}`;
    };
    const dateInsideAllocation = (
      date: Date,
      allocation: { start: Date | null; end: Date | null }
    ) => {
      if (allocation.start && date < allocation.start) return false;
      if (allocation.end && date > allocation.end) return false;
      return true;
    };
    const normalizeStatus = (value?: string | null) => String(value ?? "").trim().toUpperCase();
    const disciplineMap = new Map(
      disciplinas.map((disciplina) => {
        const fallback = (disciplina.DisDescricao || "").trim().slice(0, 3).toUpperCase();
        return [disciplina.DisCodigo, (disciplina.DisAbreviatura || fallback || String(disciplina.DisCodigo)).trim()];
      })
    );

    const rowsByStudentTurma = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.studentId}-${row.turmaId}`;
      const current = rowsByStudentTurma.get(key) || [];
      current.push(row);
      rowsByStudentTurma.set(key, current);
    }

    const relevantAttendance = attendance.filter((record) => {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      return possibleRows.some((row) => dateInsideAllocation(record.AdiDataAula, row));
    });

    const sessionMap = new Map<string, { dateKey: string; disciplina: number; educador: number }>();
    for (const record of relevantAttendance) {
      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          dateKey,
          disciplina: record.AdiDisciplina,
          educador: record.AdiEducador,
        });
      }
    }

    const sessions = [...sessionMap.entries()]
      .map(([sessionKey, session]) => ({ sessionKey, ...session }))
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
        if (a.disciplina !== b.disciplina) return a.disciplina - b.disciplina;
        return a.educador - b.educador;
      });

    const sessionKeyToColumnKey = new Map<string, string>();
    const columns = sessions.map((session) => {
      const key = `${session.dateKey}-${session.disciplina}-${session.educador}`;
      sessionKeyToColumnKey.set(session.sessionKey, key);

      return {
        key,
        label: `${toShortLabel(session.dateKey)} ${disciplineMap.get(session.disciplina) || session.disciplina}`,
        date: session.dateKey,
        ordem: session.disciplina,
      };
    });

    const studentMap = new Map(students.map((student) => [Number(student.Apr_Codigo), student.Apr_Nome || ""]));
    const unitMap = new Map(units.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao || ""]));
    const turmaMap = new Map(turmas.map((turma) => [turma.TurCodigo, turma.TurNome || ""]));
    const resultRows = new Map<
      string,
      {
        key: string;
        IdAluno: number;
        NomeJovem: string;
        UnidadeParceiro: string;
        Turma: string;
        presencas: Record<string, string>;
      }
    >();

    for (const record of relevantAttendance) {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      const allocation = possibleRows.find((row) => dateInsideAllocation(record.AdiDataAula, row));
      if (!allocation) continue;

      const dateKey = toDateKey(record.AdiDataAula);
      const sessionKey = `${dateKey}-${record.AdiDisciplina}-${record.AdiEducador}`;
      const columnKey = sessionKeyToColumnKey.get(sessionKey);
      if (!columnKey) continue;

      const hasAbsence =
        normalizeStatus(record.AdiPresenca) === "F" ||
        normalizeStatus(record.AdiPresencaTarde) === "F";
      if (!hasAbsence) continue;

      const rowKey = allocation.key;
      if (!resultRows.has(rowKey)) {
        resultRows.set(rowKey, {
          key: rowKey,
          IdAluno: allocation.studentId,
          NomeJovem: studentMap.get(allocation.studentId) || "",
          UnidadeParceiro: unitMap.get(allocation.unitId) || "",
          Turma: turmaMap.get(allocation.turmaId) || "",
          presencas: {},
        });
      }
      resultRows.get(rowKey)!.presencas[columnKey] = "F";
    }

    return {
      kind: "period-matrix",
      columns,
      students: [...resultRows.values()].sort((a, b) => {
        if (a.UnidadeParceiro !== b.UnidadeParceiro) {
          return a.UnidadeParceiro.localeCompare(b.UnidadeParceiro, "pt-BR", { numeric: true });
        }
        return a.IdAluno - b.IdAluno;
      }),
    };
  }

  async getContagemFaltasPeriodo(startDate: Date, endDate: Date, tipoPagamento?: string) {
    const normalizePayment = (value?: string | null) => {
      const normalized = String(value ?? "").trim().toUpperCase();
      if (!normalized || normalized === "T" || normalized === "TODOS") return undefined;
      if (normalized === "E" || normalized === "EMPRESA") return "E";
      if (normalized === "C" || normalized === "PROJOV" || normalized === "PROJOV") return "C";
      return normalized;
    };
    const paymentFilter = normalizePayment(tipoPagamento);

    const allocationWhere: any = {
      ALADataInicio: { gte: startDate, lte: endDate },
      OR: [
        { ALADataTermino: { lte: endDate } },
        { ALADataTermino: null, ALADataPrevTermino: { lte: endDate } },
      ],
    };
    if (paymentFilter) allocationWhere.ALApagto = paymentFilter;

    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: allocationWhere,
      select: {
        ALAAprendiz: true,
        ALATurma: true,
        ALAUnidadeParceiro: true,
        ALADataInicio: true,
        ALADataTermino: true,
        ALADataPrevTermino: true,
        ALAOrdem: true,
        ALApagto: true,
      },
      orderBy: [
        { ALAAprendiz: "asc" },
        { ALATurma: "asc" },
        { ALAUnidadeParceiro: "asc" },
        { ALAOrdem: "desc" },
      ],
    });

    if (allocations.length === 0) return [];

    const allocationRows = new Map<
      string,
      {
        key: string;
        studentId: number;
        turmaId: number;
        unitId: number;
        start: Date | null;
        end: Date | null;
        payment: string;
      }
    >();

    for (const allocation of allocations) {
      const key = `${allocation.ALAAprendiz}-${allocation.ALATurma}-${allocation.ALAUnidadeParceiro}-${allocation.ALApagto ?? ""}`;
      if (!allocationRows.has(key)) {
        allocationRows.set(key, {
          key,
          studentId: allocation.ALAAprendiz,
          turmaId: allocation.ALATurma,
          unitId: allocation.ALAUnidadeParceiro,
          start: allocation.ALADataInicio,
          end: allocation.ALADataTermino || allocation.ALADataPrevTermino,
          payment: allocation.ALApagto || "",
        });
      }
    }

    const rows = [...allocationRows.values()];
    const studentIds = [...new Set(rows.map((row) => row.studentId))];
    const turmaIds = [...new Set(rows.map((row) => row.turmaId))];
    const unitIds = [...new Set(rows.map((row) => row.unitId))];

    const [attendance, students, units] = await Promise.all([
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiCodAprendiz: { in: studentIds },
          AdiTurma: { in: turmaIds },
          AdiDataAula: { gte: startDate, lte: endDate },
        },
        select: {
          AdiCodAprendiz: true,
          AdiTurma: true,
          AdiDataAula: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
        },
      }),
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map((id) => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true, Apr_NumSistExterno: true },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigo: { in: unitIds } },
        select: { ParUniCodigo: true, ParUniDescricao: true, ParUniCNPJ: true },
      }),
    ]);

    const dateInsideAllocation = (date: Date, allocation: { start: Date | null; end: Date | null }) => {
      if (allocation.start && date < allocation.start) return false;
      if (allocation.end && date > allocation.end) return false;
      return true;
    };
    const normalizeStatus = (value?: string | null) => String(value ?? "").trim().toUpperCase();
    const isCountableStatus = (value?: string | null) => {
      const status = normalizeStatus(value);
      return Boolean(status) && status !== "N";
    };

    const rowsByStudentTurma = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.studentId}-${row.turmaId}`;
      const current = rowsByStudentTurma.get(key) || [];
      current.push(row);
      rowsByStudentTurma.set(key, current);
    }

    const totals = new Map<string, { aulasPeriodo: number; faltaSlots: number }>();
    for (const row of rows) totals.set(row.key, { aulasPeriodo: 0, faltaSlots: 0 });

    for (const record of attendance) {
      const possibleRows = rowsByStudentTurma.get(`${record.AdiCodAprendiz}-${record.AdiTurma}`) || [];
      const allocation = possibleRows.find((row) => dateInsideAllocation(record.AdiDataAula, row));
      if (!allocation) continue;

      const rowTotals = totals.get(allocation.key);
      if (!rowTotals) continue;

      for (const slot of [record.AdiPresenca, record.AdiPresencaTarde]) {
        if (!isCountableStatus(slot)) continue;
        rowTotals.aulasPeriodo++;
        if (normalizeStatus(slot) === "F") rowTotals.faltaSlots++;
      }
    }

    const studentMap = new Map(
      students.map((student) => [
        Number(student.Apr_Codigo),
        {
          nome: student.Apr_Nome || "",
          numSistExterno: student.Apr_NumSistExterno || "",
        },
      ])
    );
    const unitMap = new Map(
      units.map((unit) => [
        unit.ParUniCodigo,
        {
          parceiro: unit.ParUniDescricao || "",
          cnpj: unit.ParUniCNPJ || "",
        },
      ])
    );
    const paymentLabel = (value: string) => (value === "E" ? "Empresa" : value === "C" ? "Projov" : value || "");

    const aggregatedRows = new Map<
      string,
      {
        parceiro: string;
        cnpj: string;
        codAprendiz: number;
        numSistExt: string;
        nome: string;
        tipoPagamento: string;
        faltaSlots: number;
        aulasPeriodo: number;
      }
    >();

    for (const row of rows) {
      const rowTotals = totals.get(row.key) || { aulasPeriodo: 0, faltaSlots: 0 };
      if (rowTotals.aulasPeriodo <= 0) continue;

      const aggregateKey = `${row.studentId}-${row.unitId}-${row.payment}`;
      const current = aggregatedRows.get(aggregateKey);
      if (current) {
        current.faltaSlots += rowTotals.faltaSlots;
        current.aulasPeriodo += rowTotals.aulasPeriodo;
        continue;
      }

      const student = studentMap.get(row.studentId);
      const unit = unitMap.get(row.unitId);
      aggregatedRows.set(aggregateKey, {
        parceiro: unit?.parceiro || "",
        cnpj: unit?.cnpj || "",
        codAprendiz: row.studentId,
        numSistExt: student?.numSistExterno || "",
        nome: student?.nome || "",
        tipoPagamento: paymentLabel(row.payment),
        faltaSlots: rowTotals.faltaSlots,
        aulasPeriodo: rowTotals.aulasPeriodo,
      });
    }

    return [...aggregatedRows.values()]
      .map((row) => {
        return {
          parceiro: row.parceiro,
          cnpj: row.cnpj,
          codAprendiz: row.codAprendiz,
          numSistExt: row.numSistExt,
          nome: row.nome,
          tipoPagamento: row.tipoPagamento,
          faltaDias: Math.floor(row.faltaSlots / 2),
          horasFalta: (row.faltaSlots % 2) * 2,
          aulasPeriodo: row.aulasPeriodo,
        };
      })
      .sort((a, b) => {
        if (a.parceiro !== b.parceiro) return a.parceiro.localeCompare(b.parceiro, "pt-BR", { numeric: true });
        return a.nome.localeCompare(b.nome, "pt-BR", { numeric: true });
      });
  }

  // ─── 9. Aulas Dadas no Período ────────────────────────────────────────────
  async getAulasDadasPeriodo(startDate: Date, endDate: Date) {
    const sessions = await prisma.cA_AulasDisciplinasTurmaProf.findMany({
      where: { ADPDataAula: { gte: startDate, lte: endDate } },
      orderBy: [{ ADPDataAula: "asc" }, { ADPTurma: "asc" }, { ADPOrdemAula: "asc" }],
    });

    const turmaIds = [...new Set(sessions.map((s) => s.ADPTurma))];
    const discIds = [...new Set(sessions.map((s) => s.ADPDisciplina))];

    const [turmas, disciplinas] = await Promise.all([
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: turmaIds } },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_Disciplinas.findMany({
        where: { DisCodigo: { in: discIds } },
        select: { DisCodigo: true, DisDescricao: true },
      }),
    ]);

    const turmaMap = new Map(turmas.map((t) => [t.TurCodigo, t.TurNome || ""]));
    const discMap = new Map(disciplinas.map((d) => [d.DisCodigo, d.DisDescricao || ""]));

    return sessions.map((s) => ({
      data: s.ADPDataAula,
      ordem: s.ADPOrdemAula,
      turma: turmaMap.get(s.ADPTurma) || "",
      disciplina: discMap.get(s.ADPDisciplina) || "",
      conteudo: s.ADPConteudoLecionado || "",
      recursos: s.ADPRecursosUsados || "",
    }));
  }

  // ─── 10. Aprendizes com X+ Faltas ─────────────────────────────────────────
  async getAprendizesComFaltas(
    minFaltas: number,
    startDate: Date,
    endDate: Date,
    turmaId?: number,
    parceiroId?: number
  ) {
    const whereAtt: any = {
      AdiDataAula: { gte: startDate, lte: endDate },
      AdiPresenca: "F",
    };
    if (turmaId) whereAtt.AdiTurma = turmaId;

    const absences = await prisma.cA_AulasDisciplinasAprendiz.findMany({
      where: whereAtt,
      select: { AdiCodAprendiz: true, AdiTurma: true },
    });

    // count faltas per student-turma pair
    const countMap = new Map<string, { studentId: number; turmaId: number; faltas: number }>();
    for (const a of absences) {
      const key = `${a.AdiCodAprendiz}-${a.AdiTurma}`;
      if (!countMap.has(key))
        countMap.set(key, { studentId: a.AdiCodAprendiz, turmaId: a.AdiTurma, faltas: 0 });
      countMap.get(key)!.faltas++;
    }

    const pairs = [...countMap.values()].filter((p) => p.faltas >= minFaltas);
    if (pairs.length === 0) return [];

    let studentIds = [...new Set(pairs.map((p) => p.studentId))];

    // filter by parceiro if given
    if (parceiroId) {
      const units = await prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigoParceiro: parceiroId },
        select: { ParUniCodigo: true },
      });
      const unitIds = units.map((u) => u.ParUniCodigo);
      const allocs = await prisma.cA_AlocacaoAprendiz.findMany({
        where: { ALAAprendiz: { in: studentIds }, ALAUnidadeParceiro: { in: unitIds } },
        select: { ALAAprendiz: true },
      });
      studentIds = [...new Set(allocs.map((a) => a.ALAAprendiz))];
    }

    const tIds = [...new Set(pairs.map((p) => p.turmaId))];

    const [students, turmas, allocations] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds.map(id => BigInt(id)) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Nome: "asc" },
      }),
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: tIds } },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_AlocacaoAprendiz.findMany({
        where: { ALAAprendiz: { in: studentIds } },
        select: { ALAAprendiz: true, ALAUnidadeParceiro: true },
        orderBy: { ALAOrdem: "desc" },
      }),
    ]);

    const turmaMap = new Map(turmas.map((t) => [t.TurCodigo, t.TurNome || ""]));
    const allocationMap = new Map<number, number>();
    for (const a of allocations) {
      if (!allocationMap.has(a.ALAAprendiz))
        allocationMap.set(a.ALAAprendiz, a.ALAUnidadeParceiro);
    }

    const unitIds = [...new Set([...allocationMap.values()])];
    const partnerUnits = unitIds.length
      ? await prisma.cA_ParceirosUnidade.findMany({
          where: { ParUniCodigo: { in: unitIds } },
          select: { ParUniCodigo: true, ParUniDescricao: true },
        })
      : [];
    const unitMap = new Map(partnerUnits.map((u) => [u.ParUniCodigo, u.ParUniDescricao]));
    const studentMap = new Map(students.map((s) => [Number(s.Apr_Codigo), s.Apr_Nome]));

    return pairs
      .filter((p) => studentIds.includes(p.studentId))
      .map((p) => {
        const unitId = allocationMap.get(p.studentId);
        return {
          IdAluno: p.studentId,
          NomeJovem: studentMap.get(p.studentId) || "",
          turma: turmaMap.get(p.turmaId) || "",
          unidadeParceiro: unitId ? (unitMap.get(unitId) || "") : "",
          faltas: p.faltas,
        };
      })
      .sort((a, b) => b.faltas - a.faltas);
  }
}
