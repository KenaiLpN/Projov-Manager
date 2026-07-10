import { prisma } from "../lib/prisma";

function fmtDate(v: any) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().substring(0, 10);
  return String(v).substring(0, 10);
}

export class CA_FaltasCapacitacaoService {
  async getDatas(turmaId: number) {
    const rows = await prisma.cA_AulasCapacitacaoAprendiz.findMany({
      where: { AcpTurma: turmaId },
      select: { AcpDataAula: true },
      distinct: ["AcpDataAula"],
      orderBy: { AcpDataAula: "desc" },
    });
    return rows.map(r => fmtDate(r.AcpDataAula));
  }

  async getAprendizesDaTurma(turmaId: number) {
    const caps = await prisma.cA_CapacitacaoAprendiz.findMany({
      where: { CapTurma: turmaId },
      select: { CapAprendiz: true },
    });
    if (caps.length === 0) return [];
    const ids = caps.map(c => BigInt(c.CapAprendiz));
    const aprendizes = await prisma.cA_Aprendiz.findMany({
      where: { Apr_Codigo: { in: ids } },
      select: { Apr_Codigo: true, Apr_Nome: true },
      orderBy: { Apr_Nome: "asc" },
    });
    return aprendizes.map(a => ({
      Apr_Codigo: Number(a.Apr_Codigo),
      Apr_Nome: a.Apr_Nome ?? "",
    }));
  }

  async getPresencas(turmaId: number, data: string) {
    const dataInicio = new Date(data + "T00:00:00");
    const dataFim    = new Date(data + "T23:59:59");
    const rows = await prisma.cA_AulasCapacitacaoAprendiz.findMany({
      where: {
        AcpTurma:   turmaId,
        AcpDataAula: { gte: dataInicio, lte: dataFim },
      },
    });
    return rows.map(r => ({
      AcpAprendiz: r.AcpAprendiz,
      AcpTurma:    r.AcpTurma,
      AcpDataAula: fmtDate(r.AcpDataAula),
      AcpPresenca: r.AcpPresenca,
    }));
  }

  async savePresencas(
    registros: { aprendiz: number; turma: number; data: string; presenca: string | null; usuario: string }[]
  ) {
    const ops = registros.map(r => {
      const dataAula = new Date(r.data + "T00:00:00");
      return prisma.cA_AulasCapacitacaoAprendiz.upsert({
        where: {
          AcpAprendiz_AcpTurma_AcpDataAula: {
            AcpAprendiz: r.aprendiz,
            AcpTurma:    r.turma,
            AcpDataAula: dataAula,
          },
        },
        update: {
          AcpPresenca:      r.presenca,
          AcpUsuario:       r.usuario,
          AcpDataAlteracao: new Date(),
        },
        create: {
          AcpAprendiz:      r.aprendiz,
          AcpTurma:         r.turma,
          AcpDataAula:      dataAula,
          AcpPresenca:      r.presenca,
          AcpUsuario:       r.usuario,
          AcpDataAlteracao: new Date(),
        },
      });
    });
    await prisma.$transaction(ops);
  }

  async getTurmaInfo(turmaId: number) {
    const turma = await prisma.cA_Turmas.findUnique({
      where: { TurCodigo: turmaId },
      select: {
        TurCodigo:      true,
        TurNome:        true,
        TurCurso:       true,
        TurDiaSemana:   true,
        TurDiaSemana02: true,
      },
    });
    if (!turma) return null;

    let CurDescricao: string | null = null;
    if (turma.TurCurso) {
      const curso = await prisma.cA_Cursos.findUnique({
        where: { CurCodigo: turma.TurCurso },
        select: { CurDescricao: true },
      });
      CurDescricao = curso?.CurDescricao ?? null;
    }

    return { ...turma, CurDescricao };
  }

  async lancarAula(turmaId: number, data: string, usuario: string) {
    const caps = await prisma.cA_CapacitacaoAprendiz.findMany({
      where: { CapTurma: turmaId },
      select: { CapAprendiz: true },
    });
    const dataAula = new Date(data + "T00:00:00");
    await prisma.cA_AulasCapacitacaoAprendiz.createMany({
      data: caps.map(c => ({
        AcpAprendiz:      c.CapAprendiz,
        AcpTurma:         turmaId,
        AcpDataAula:      dataAula,
        AcpPresenca:      null,
        AcpUsuario:       usuario,
        AcpDataAlteracao: new Date(),
      })),
      skipDuplicates: true,
    });
    return { count: caps.length };
  }
}
