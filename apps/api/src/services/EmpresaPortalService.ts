import { prisma } from "../lib/prisma";

const monthNames = [
  "", "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function dateOnly(value: Date | null | undefined) {
  return value?.toISOString().slice(0, 10) ?? null;
}

export class EmpresaPortalService {
  private async unitIds(partnerId: number) {
    return (await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigoParceiro: partnerId },
      select: { ParUniCodigo: true },
    })).map((unit) => unit.ParUniCodigo);
  }

  async areas() {
    return prisma.cA_AreaAtuacao.findMany({
      orderBy: { AreaDescricao: "asc" },
      select: { AreaCodigo: true, AreaDescricao: true },
    });
  }

  async assessments(partnerId: number, status: "pendentes" | "realizadas") {
    const unitIds = await this.unitIds(partnerId);
    if (!unitIds.length) return [];

    const records = await prisma.cA_Pesquisa_Parceiro.findMany({
      where: {
        PepParceiroCodigo: { in: unitIds },
        PepRealizada: status === "realizadas" ? "S" : { not: "S" },
      },
      orderBy: [{ PepAno: "desc" }, { PepMes: "desc" }, { PepCodigo: "desc" }],
      take: 500,
    });
    const apprenticeIds = [...new Set(records.flatMap((item) => item.PepAprendiz ? [item.PepAprendiz] : []))];
    const researchIds = [...new Set(records.map((item) => item.PepPesquisaCodigo))];
    const [apprentices, research, units, turmas] = await Promise.all([
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: apprenticeIds.map(BigInt) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
      }),
      prisma.cA_Pesquisa.findMany({
        where: { PesCodigo: { in: researchIds } },
        select: { PesCodigo: true, PesNome: true },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigo: { in: unitIds } },
        select: { ParUniCodigo: true, ParUniDescricao: true },
      }),
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: records.flatMap((item) => item.PepTurma ? [item.PepTurma] : []) } },
        select: { TurCodigo: true, TurNome: true },
      }),
    ]);
    const apprenticeMap = new Map(apprentices.map((item) => [Number(item.Apr_Codigo), item.Apr_Nome ?? ""]));
    const researchMap = new Map(research.map((item) => [item.PesCodigo, item.PesNome]));
    const unitMap = new Map(units.map((item) => [item.ParUniCodigo, item.ParUniDescricao]));
    const turmaMap = new Map(turmas.map((item) => [item.TurCodigo, item.TurNome]));

    return records.map((item) => ({
      codigo: item.PepCodigo,
      unidade: unitMap.get(item.PepParceiroCodigo) ?? "",
      aprendizCodigo: item.PepAprendiz,
      aprendiz: item.PepAprendiz ? apprenticeMap.get(item.PepAprendiz) ?? "" : "",
      pesquisa: researchMap.get(item.PepPesquisaCodigo) ?? "",
      mes: monthNames[item.PepMes] ?? String(item.PepMes),
      ano: item.PepAno,
      situacao: item.PepRealizada === "S" ? "Realizada" : "Pendente",
      turma: item.PepTurma ? turmaMap.get(item.PepTurma) ?? `Turma ${item.PepTurma}` : "",
      dataRealizada: dateOnly(item.PepDataRealizada),
      consideracoes: item.PepConsideracoes,
    }));
  }

  async absences(partnerId: number, startDate: Date, endDate: Date) {
    const unitIds = await this.unitIds(partnerId);
    if (!unitIds.length) return [];
    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: { ALAUnidadeParceiro: { in: unitIds } },
      select: { ALAAprendiz: true, ALATurma: true, ALAUnidadeParceiro: true },
    });
    const apprenticeIds = [...new Set(allocations.map((item) => item.ALAAprendiz))];
    const turmaIds = [...new Set(allocations.map((item) => item.ALATurma))];
    if (!apprenticeIds.length) return [];

    const [attendance, apprentices, units] = await Promise.all([
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: {
          AdiCodAprendiz: { in: apprenticeIds },
          AdiTurma: { in: turmaIds },
          AdiDataAula: { gte: startDate, lte: endDate },
          OR: [{ AdiPresenca: "F" }, { AdiPresencaTarde: "F" }],
        },
        select: { AdiCodAprendiz: true, AdiTurma: true, AdiPresenca: true, AdiPresencaTarde: true },
      }),
      prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: apprenticeIds.map(BigInt) } },
        select: { Apr_Codigo: true, Apr_Nome: true },
      }),
      prisma.cA_ParceirosUnidade.findMany({
        where: { ParUniCodigo: { in: unitIds } },
        select: { ParUniCodigo: true, ParUniDescricao: true },
      }),
    ]);
    const allocationMap = new Map(allocations.map((item) => [`${item.ALAAprendiz}-${item.ALATurma}`, item.ALAUnidadeParceiro]));
    const apprenticeMap = new Map(apprentices.map((item) => [Number(item.Apr_Codigo), item.Apr_Nome ?? ""]));
    const unitMap = new Map(units.map((item) => [item.ParUniCodigo, item.ParUniDescricao]));
    const counts = new Map<string, { aprendizCodigo: number; aprendiz: string; unidade: string; faltas: number }>();
    for (const item of attendance) {
      const unitId = allocationMap.get(`${item.AdiCodAprendiz}-${item.AdiTurma}`);
      if (!unitId) continue;
      const key = `${item.AdiCodAprendiz}-${unitId}`;
      const row = counts.get(key) ?? {
        aprendizCodigo: item.AdiCodAprendiz,
        aprendiz: apprenticeMap.get(item.AdiCodAprendiz) ?? "",
        unidade: unitMap.get(unitId) ?? "",
        faltas: 0,
      };
      row.faltas += (item.AdiPresenca === "F" ? 1 : 0) + (item.AdiPresencaTarde === "F" ? 1 : 0);
      counts.set(key, row);
    }
    return [...counts.values()].sort((a, b) => b.faltas - a.faltas || a.aprendiz.localeCompare(b.aprendiz));
  }
}
