import { prisma } from "../lib/prisma";
import {
  CreateConceitoBody,
  UpdateConceitoBody,
} from "../schemas/conceitoSchema";
export class ConceitoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.ConCodigo = { contains: search };
      }
      const [conceitos, total] = await Promise.all([
        prisma.cA_Conceitos.findMany({
          where,
          orderBy: { ConCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Conceitos.count({ where }),
      ]);
      return {
        data: conceitos,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar conceitos:", error);
      throw error;
    }
  }
  async create(data: CreateConceitoBody) {
    try {
      return await prisma.cA_Conceitos.create({
        data: {
          ConCodigo: data.ConCodigo,
          ConNota: data.ConNota || 0,
          ConPercentual: data.ConPercentual || 0,
          ConAprova: data.ConAprova,
        },
      });
    } catch (error) {
      console.error("Erro ao criar conceito:", error);
      throw error;
    }
  }
  async update(id: string, data: UpdateConceitoBody) {
    try {
      const payload: any = {};
      if (data.ConNota !== undefined) payload.ConNota = data.ConNota;
      if (data.ConPercentual !== undefined)
        payload.ConPercentual = data.ConPercentual;
      if (data.ConAprova !== undefined) payload.ConAprova = data.ConAprova;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Conceitos.update({
        where: { ConCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar conceito:", error);
      return null;
    }
  }
  async delete(id: string) {
    try {
      await prisma.cA_Conceitos.delete({
        where: { ConCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar conceito:", error);
      return null;
    }
  }
}
