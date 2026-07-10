import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateCadastroRegiaoBody,
  UpdateCadastroRegiaoBody,
} from "../schemas/cadastroRegiaoSchema";
export class CadastroRegiaoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.DescRegiao = { contains: search };
      }
      const [regioes, total] = await Promise.all([
        prisma.cA_Regioes.findMany({
          where,
          orderBy: { CodRegiao: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Regioes.count({ where }),
      ]);
      return {
        data: regioes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar regiões:", error);
      throw error;
    }
  }
  async create(data: CreateCadastroRegiaoBody) {
    try {
      return await createWithNextId("CA_Regioes", "CodRegiao", (tx, nextId) => tx.cA_Regioes.create({
        data: {
          CodRegiao: nextId,
          DescRegiao: data.DescRegiao,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar região:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateCadastroRegiaoBody) {
    try {
      const payload: any = {};
      if (data.DescRegiao !== undefined) payload.DescRegiao = data.DescRegiao;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Regioes.update({
        where: { CodRegiao: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar região:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Regioes.delete({
        where: { CodRegiao: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar região:", error);
      return null;
    }
  }
}
