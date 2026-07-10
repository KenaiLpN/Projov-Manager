import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateSituacaoBody,
  UpdateSituacaoBody,
} from "../schemas/situacaoParticipanteSchema";
export class SituacaoParticipanteService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { StaAbreviatura: { contains: search } },
          { StaDescricao: { contains: search } },
          { StaArea: { contains: search } },
        ];
      }
      const [situacoes, total] = await Promise.all([
        prisma.cA_SituacaoAprendiz.findMany({
          where,
          orderBy: { StaCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_SituacaoAprendiz.count({ where }),
      ]);
      return {
        data: situacoes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar situações:", error);
      throw error;
    }
  }
  async create(data: CreateSituacaoBody) {
    try {
      return await createWithNextId("CA_SituacaoAprendiz", "StaCodigo", (tx, nextId) => tx.cA_SituacaoAprendiz.create({
        data: {
          StaCodigo: nextId,
          StaAbreviatura: data.StaAbreviatura,
          StaDescricao: data.StaDescricao,
          StaArea: data.StaArea,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar situação:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateSituacaoBody) {
    try {
      const payload: any = {};
      if (data.StaAbreviatura !== undefined)
        payload.StaAbreviatura = data.StaAbreviatura;
      if (data.StaDescricao !== undefined)
        payload.StaDescricao = data.StaDescricao;
      if (data.StaArea !== undefined) payload.StaArea = data.StaArea;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_SituacaoAprendiz.update({
        where: { StaCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar situação:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_SituacaoAprendiz.delete({
        where: { StaCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir situação:", error);
      return null;
    }
  }
}
