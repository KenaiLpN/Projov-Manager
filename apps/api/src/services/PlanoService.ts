import { prisma } from "../lib/prisma";

export class PlanoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.PlanDescricao = { contains: search };
      }
      const [planos, total] = await Promise.all([
        prisma.cA_Planos.findMany({
          where,
          orderBy: { PlanCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Planos.count({ where }),
      ]);
      return {
        data: planos,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar planos:", error);
      throw error;
    }
  }
  async getById(id: number) {
    try {
      const plano = await prisma.cA_Planos.findUnique({
        where: { PlanCodigo: id },
      });
      return plano;
    } catch (error) {
      console.error("Erro ao buscar plano por id:", error);
      throw error;
    }
  }

  async create(data: { PlanCurso: string; PlanDescricao?: string }) {
    try {
      const plano = await prisma.cA_Planos.create({
        data,
      });
      return plano;
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      throw error;
    }
  }

  async update(id: number, data: { PlanCurso?: string; PlanDescricao?: string }) {
    try {
      const plano = await prisma.cA_Planos.update({
        where: { PlanCodigo: id },
        data,
      });
      return plano;
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await prisma.cA_Planos.delete({
        where: { PlanCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao deletar plano:", error);
      throw error;
    }
  }
}
