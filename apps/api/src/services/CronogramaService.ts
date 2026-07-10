import { prisma } from "../lib/prisma";

type CronogramaDate = {
  key: string;
  label: string;
  weekday: string;
  aulas: number;
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
  if (start === null) return [];
  if (end === null || end < start) return [start];

  const days: number[] = [];
  for (let day = start; day <= end; day += 1) {
    days.push(day);
  }
  return days;
}

function buildDates(startDate: string, endDate: string, weekdays: number[], aulasByDate: Map<string, number>) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const allowed = new Set(weekdays);
  const dates: CronogramaDate[] = [];

  for (const current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    if (!allowed.has(current.getDay())) continue;
    const copy = new Date(current);
    const key = toDateKey(copy);
    dates.push({
      key,
      label: formatDateBr(copy),
      weekday: copy.toLocaleDateString("pt-BR", { weekday: "long" }),
      aulas: aulasByDate.get(key) ?? 0,
    });
  }

  return dates;
}

export class CronogramaService {
  async getCronogramaTurma(turmaId: number, startDate: string, endDate: string) {
    const turma = await prisma.cA_Turmas.findUnique({
      where: { TurCodigo: turmaId },
      select: {
        TurCodigo: true,
        TurNome: true,
        TurDiaSemana: true,
        TurDiaSemana02: true,
      },
    });

    if (!turma) {
      return { turma: null, dates: [], students: [] };
    }

    const [allocations, attendanceCounts] = await Promise.all([
      prisma.cA_AlocacaoAprendiz.findMany({
        where: { ALATurma: turmaId },
        select: { ALAAprendiz: true },
      }),
      prisma.cA_AulasDisciplinasAprendiz.groupBy({
        by: ["AdiDataAula"],
        where: {
          AdiTurma: turmaId,
          AdiDataAula: {
            gte: parseDateOnly(startDate),
            lte: parseDateOnly(endDate),
          },
        },
        _count: { _all: true },
      }),
    ]);

    const allocationIds = new Set(allocations.map((allocation) => allocation.ALAAprendiz));
    const students = await prisma.cA_Aprendiz.findMany({
      where: {
        OR: [
          ...(allocationIds.size > 0
            ? [{ Apr_Codigo: { in: [...allocationIds].map((id) => BigInt(id)) } }]
            : []),
          { Apr_Turma: turmaId },
          { Apr_TurmaCCI: turmaId },
          { Apr_TurmaENC: turmaId },
        ],
      },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
      },
      orderBy: { Apr_Nome: "asc" },
    });

    const aulasByDate = new Map(
      attendanceCounts.map((item) => [toDateKey(item.AdiDataAula), item._count._all]),
    );

    const dates = buildDates(
      startDate,
      endDate,
      resolveWeekdays(turma.TurDiaSemana, turma.TurDiaSemana02),
      aulasByDate,
    );

    return {
      turma: {
        codigo: turma.TurCodigo,
        nome: turma.TurNome ?? "",
        dias: {
          principal: turma.TurDiaSemana,
          secundario: turma.TurDiaSemana02,
        },
      },
      dates,
      students: students.map((student) => ({
        codigo: Number(student.Apr_Codigo),
        nome: student.Apr_Nome ?? "",
        cells: dates.map((date) => ({ date: date.key, value: "" })),
      })),
    };
  }
}
