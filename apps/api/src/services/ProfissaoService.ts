import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateProfissaoBody,
  UpdateProfissaoBody,
} from "../schemas/profissaoSchema";
export class ProfissaoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.ProfDescricao = { contains: search };
      }
      const [profissoes, total] = await Promise.all([
        prisma.cA_Profissoes.findMany({
          where,
          orderBy: { ProfCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Profissoes.count({ where }),
      ]);
      return {
        data: profissoes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar profissões:", error);
      throw error;
    }
  }
  async create(data: CreateProfissaoBody) {
    try {
      return await createWithNextId("CA_Profissoes", "ProfCodigo", (tx, nextId) => tx.cA_Profissoes.create({
        data: {
          ProfCodigo: nextId,
          ProfDescricao: data.ProfDescricao,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar profissão:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateProfissaoBody) {
    try {
      const payload: any = {};
      if (data.ProfDescricao !== undefined)
        payload.ProfDescricao = data.ProfDescricao;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Profissoes.update({
        where: { ProfCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar profissão:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Profissoes.delete({
        where: { ProfCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir profissão:", error);
      return null;
    }
  }
}
