import { prisma } from "../lib/prisma";
import {
  CreateStatusEncaminhamentoBody,
  UpdateStatusEncaminhamentoBody,
} from "../schemas/statusEncaminhamentoSchema";
export class StatusEncaminhamentoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { Ste_Codigo: { contains: search } },
          { Ste_Descricao: { contains: search } },
        ];
      }
      const [statusList, total] = await Promise.all([
        prisma.cA_StatusEncaminhamento.findMany({
          where,
          orderBy: { Ste_Codigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_StatusEncaminhamento.count({ where }),
      ]);
      return {
        data: statusList,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar status:", error);
      throw error;
    }
  }
  async create(data: CreateStatusEncaminhamentoBody) {
    const existing = await prisma.cA_StatusEncaminhamento.findUnique({
      where: { Ste_Codigo: data.Ste_Codigo },
    });
    if (existing) {
      throw new Error("Código já existe.");
    }
    return await prisma.cA_StatusEncaminhamento.create({
      data: {
        Ste_Codigo: data.Ste_Codigo,
        Ste_Descricao: data.Ste_Descricao,
      },
    });
  }
  async update(id: string, data: UpdateStatusEncaminhamentoBody) {
    try {
      const payload: any = {};
      if (data.Ste_Descricao !== undefined)
        payload.Ste_Descricao = data.Ste_Descricao;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_StatusEncaminhamento.update({
        where: { Ste_Codigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      return null;
    }
  }
  async delete(id: string) {
    try {
      await prisma.cA_StatusEncaminhamento.delete({
        where: { Ste_Codigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar status:", error);
      return null;
    }
  }
}
