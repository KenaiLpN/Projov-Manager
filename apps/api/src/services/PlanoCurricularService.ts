import { prisma } from "../lib/prisma";

export class PlanoCurricularService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      const searchAsInt = parseInt(search, 10);
      if (!isNaN(searchAsInt)) {
        where.PlcCodigoPlano = searchAsInt;
      } else {
        where.PlcDescricao = { contains: search };
      }
    }

    const [items, total] = await Promise.all([
      prisma.cA_PlanoCurricular.findMany({
        where,
        orderBy: [{ PlcCodigoPlano: "asc" }, { PlcOrdemDisciplina: "asc" }],
        skip,
        take: limit,
      }),
      prisma.cA_PlanoCurricular.count({ where }),
    ]);

    if (items.length === 0) {
      return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Coleta IDs únicos para buscar as entidades relacionadas
    const planoIds = [...new Set(items.map((i) => i.PlcCodigoPlano))];
    const disciplinaIds = [...new Set(items.map((i) => i.PlcDisciplina))];
    const educadorIds = [
      ...new Set(items.map((i) => i.EducCodigo).filter(Boolean)),
    ] as number[];

    const [planos, disciplinas, educadores] = await Promise.all([
      prisma.cA_Planos.findMany({
        where: { PlanCodigo: { in: planoIds } },
        select: { PlanCodigo: true, PlanDescricao: true, PlanCurso: true },
      }),
      prisma.cA_Disciplinas.findMany({
        where: { DisCodigo: { in: disciplinaIds } },
        select: { DisCodigo: true, DisDescricao: true },
      }),
      educadorIds.length > 0
        ? prisma.cA_Educadores.findMany({
            where: { EducCodigo: { in: educadorIds } },
            select: { EducCodigo: true, EducNome: true },
          })
        : Promise.resolve([]),
    ]);

    const planoMap = new Map(planos.map((p) => [p.PlanCodigo, p]));
    const disciplinaMap = new Map(disciplinas.map((d) => [d.DisCodigo, d]));
    const educadorMap = new Map(educadores.map((e) => [e.EducCodigo, e]));

    const data = items.map((item) => ({
      ...item,
      plano: planoMap.get(item.PlcCodigoPlano) ?? null,
      disciplina: disciplinaMap.get(item.PlcDisciplina) ?? null,
      educador: item.EducCodigo ? educadorMap.get(item.EducCodigo) ?? null : null,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: {
    PlcCodigoPlano: number;
    PlcDisciplina: number;
    PlcCargaHoraria?: number;
    PlcTipoAvaliacao?: string;
    PlcNumeroAulas?: number;
    PlcDescricao?: string;
    PlcOrdemDisciplina?: number;
    PlcGeraCronograma?: string;
    EducCodigo?: number;
  }) {
    try {
      return await prisma.cA_PlanoCurricular.create({ data });
    } catch (error) {
      console.error("Erro ao criar plano curricular:", error);
      throw error;
    }
  }

  async update(
    codigoPlano: number,
    disciplina: number,
    data: {
      PlcCargaHoraria?: number | null;
      PlcTipoAvaliacao?: string | null;
      PlcNumeroAulas?: number | null;
      PlcDescricao?: string | null;
      PlcOrdemDisciplina?: number | null;
      PlcGeraCronograma?: string | null;
      EducCodigo?: number | null;
    }
  ) {
    try {
      return await prisma.cA_PlanoCurricular.update({
        where: {
          PlcCodigoPlano_PlcDisciplina: {
            PlcCodigoPlano: codigoPlano,
            PlcDisciplina: disciplina,
          },
        },
        data,
      });
    } catch (error) {
      console.error("Erro ao atualizar plano curricular:", error);
      throw error;
    }
  }

  async delete(codigoPlano: number, disciplina: number) {
    try {
      await prisma.cA_PlanoCurricular.delete({
        where: {
          PlcCodigoPlano_PlcDisciplina: {
            PlcCodigoPlano: codigoPlano,
            PlcDisciplina: disciplina,
          },
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar plano curricular:", error);
      throw error;
    }
  }
}