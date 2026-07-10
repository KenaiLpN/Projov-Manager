import { prisma } from "../lib/prisma";

function fmtDate(v: any) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().substring(0, 10);
  return String(v).substring(0, 10);
}

function serialize(c: any) {
  return {
    ...c,
    CapDataInicio:      fmtDate(c.CapDataInicio),
    CapDataPrevTermino: fmtDate(c.CapDataPrevTermino),
    CapDataTermino:     fmtDate(c.CapDataTermino),
  };
}

export class CA_CapacitacaoService {
  async getByAprendiz(aprendizId: number) {
    const caps = await prisma.cA_CapacitacaoAprendiz.findMany({
      where: { CapAprendiz: aprendizId },
      orderBy: { CapSequencia: "desc" },
    });

    const unidadeIds = [...new Set(caps.map(c => c.CapUnidade).filter(Boolean))] as number[];
    const unidadeMap = new Map<number, string>();
    if (unidadeIds.length > 0) {
      const unidades = await prisma.cA_Unidades.findMany({
        where: { UniCodigo: { in: unidadeIds } },
        select: { UniCodigo: true, UniNome: true },
      });
      unidades.forEach(u => { if (u.UniNome) unidadeMap.set(u.UniCodigo, u.UniNome); });
    }

    return caps.map(c => ({
      ...serialize(c),
      unidadeNome: unidadeMap.get(c.CapUnidade) ?? null,
    }));
  }

  async create(aprendizId: number, data: any) {
    const payload: any = {
      CapAprendiz:        aprendizId,
      CapTurma:           Number(data.CapTurma),
      CapStatus:          data.CapStatus || "A",
      CapUnidade:         Number(data.CapUnidade),
      CapDataInicio:      new Date(data.CapDataInicio),
      CapDataPrevTermino: data.CapDataPrevTermino ? new Date(data.CapDataPrevTermino) : null,
      CapDataTermino:     data.CapDataTermino ? new Date(data.CapDataTermino) : null,
      CapObservacoes:     data.CapObservacoes || null,
    };
    try {
      const created = await prisma.cA_CapacitacaoAprendiz.create({ data: payload });
      return serialize(created);
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("Este aprendiz já possui uma capacitação nesta turma.");
      throw error;
    }
  }

  async update(id: number, data: any) {
    const payload: any = {};
    if (data.CapTurma !== undefined)           payload.CapTurma = Number(data.CapTurma);
    if (data.CapStatus !== undefined)          payload.CapStatus = data.CapStatus;
    if (data.CapUnidade !== undefined)         payload.CapUnidade = Number(data.CapUnidade);
    if (data.CapDataInicio !== undefined)      payload.CapDataInicio = data.CapDataInicio ? new Date(data.CapDataInicio) : undefined;
    if (data.CapDataPrevTermino !== undefined) payload.CapDataPrevTermino = data.CapDataPrevTermino ? new Date(data.CapDataPrevTermino) : null;
    if (data.CapDataTermino !== undefined)     payload.CapDataTermino = data.CapDataTermino ? new Date(data.CapDataTermino) : null;
    if (data.CapObservacoes !== undefined)     payload.CapObservacoes = data.CapObservacoes || null;

    try {
      const updated = await prisma.cA_CapacitacaoAprendiz.update({
        where: { CapSequencia: id },
        data: payload,
      });
      return serialize(updated);
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("Este aprendiz já possui uma capacitação nesta turma.");
      throw error;
    }
  }

  async delete(id: number) {
    return await prisma.cA_CapacitacaoAprendiz.delete({
      where: { CapSequencia: id },
    });
  }
}
