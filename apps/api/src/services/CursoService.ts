import { prisma } from "../lib/prisma";
import { CreateCursoBody, UpdateCursoBody } from "../schemas/cursoSchema";
export class CursoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { CurDescricao: { contains: search } },
          { CurCodigo: { contains: search } },
        ];
      }
      const [cursos, total] = await Promise.all([
        prisma.cA_Cursos.findMany({
          where,
          orderBy: { CurCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Cursos.count({ where }),
      ]);
      return {
        data: cursos,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar cursos:", error);
      throw error;
    }
  }
  async create(data: CreateCursoBody) {
    try {
      return await prisma.cA_Cursos.create({
        data: {
          CurCodigo: data.CurCodigo,
          CurDescricao: data.CurDescricao,
          CurCargaHoraria: data.CurCargaHoraria || 0,
          CurAbreviatura: data.CurAbreviatura || "",
          EnsNumeroPeriodos: data.EnsNumeroPeriodos || 0,
        },
      });
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      throw error;
    }
  }
  async update(id: string, data: UpdateCursoBody) {
    try {
      const payload: any = {};
      if (data.CurDescricao !== undefined)
        payload.CurDescricao = data.CurDescricao;
      if (data.CurCargaHoraria !== undefined)
        payload.CurCargaHoraria = data.CurCargaHoraria;
      if (data.CurAbreviatura !== undefined)
        payload.CurAbreviatura = data.CurAbreviatura;
      if (data.EnsNumeroPeriodos !== undefined)
        payload.EnsNumeroPeriodos = data.EnsNumeroPeriodos;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Cursos.update({
        where: { CurCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      return null;
    }
  }
  async delete(id: string) {
    try {
      await prisma.cA_Cursos.delete({
        where: { CurCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
      return null;
    }
  }
}
