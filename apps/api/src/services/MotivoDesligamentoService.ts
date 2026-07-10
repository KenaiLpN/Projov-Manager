import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateMotivoDesligamentoBody,
  UpdateMotivoDesligamentoBody,
} from "../schemas/motivoDesligamentoSchema";
export class MotivoDesligamentoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.MotDescricao = { contains: search };
      }
      const [motivos, total] = await Promise.all([
        prisma.cA_MotivoDesligamento.findMany({
          where,
          orderBy: { MotCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_MotivoDesligamento.count({ where }),
      ]);
      return {
        data: motivos,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar motivos de desligamento:", error);
      throw error;
    }
  }
  async create(data: CreateMotivoDesligamentoBody) {
    try {
      return await createWithNextId("CA_MotivoDesligamento", "MotCodigo", (tx, nextId) => tx.cA_MotivoDesligamento.create({
        data: {
          MotCodigo: nextId,
          MotDescricao: data.MotDescricao,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar motivo de desligamento:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateMotivoDesligamentoBody) {
    try {
      const payload: any = {};
      if (data.MotDescricao !== undefined)
        payload.MotDescricao = data.MotDescricao;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_MotivoDesligamento.update({
        where: { MotCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar motivo de desligamento:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_MotivoDesligamento.delete({
        where: { MotCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir motivo de desligamento:", error);
      return null;
    }
  }
}
