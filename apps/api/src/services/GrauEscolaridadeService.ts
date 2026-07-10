import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateGrauEscolaridadeBody,
  UpdateGrauEscolaridadeBody,
} from "../schemas/grauEscolaridadeSchema";
export class GrauEscolaridadeService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.GreDescricao = { contains: search };
      }
      const [graus, total] = await Promise.all([
        prisma.cA_GrauEscolaridade.findMany({
          where,
          orderBy: { GreCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_GrauEscolaridade.count({ where }),
      ]);
      return {
        data: graus,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar graus de escolaridade:", error);
      throw error;
    }
  }
  async create(data: CreateGrauEscolaridadeBody) {
    try {
      return await createWithNextId("CA_GrauEscolaridade", "GreCodigo", (tx, nextId) => tx.cA_GrauEscolaridade.create({
        data: {
          GreCodigo: nextId,
          GreDescricao: data.GreDescricao,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar grau de escolaridade:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateGrauEscolaridadeBody) {
    try {
      const payload: any = {};
      if (data.GreDescricao !== undefined)
        payload.GreDescricao = data.GreDescricao;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_GrauEscolaridade.update({
        where: { GreCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar grau de escolaridade:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_GrauEscolaridade.delete({
        where: { GreCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir grau de escolaridade:", error);
      return null;
    }
  }
}
