import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateDisciplinaBody,
  UpdateDisciplinaBody,
} from "../schemas/disciplinaSchema";
export class DisciplinaService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.DisDescricao = { contains: search };
      }
      const [disciplinas, total] = await Promise.all([
        prisma.cA_Disciplinas.findMany({
          where,
          orderBy: { DisCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Disciplinas.count({ where }),
      ]);
      return {
        data: disciplinas,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar disciplinas:", error);
      throw error;
    }
  }
  async create(data: CreateDisciplinaBody) {
    try {
      return await createWithNextId("CA_Disciplinas", "DisCodigo", (tx, nextId) => tx.cA_Disciplinas.create({
        data: {
          DisCodigo: nextId,
          DisDescricao: data.DisDescricao,
          DisAbreviatura: data.DisAbreviatura,
          DisCor: data.DisCor,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar disciplina:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateDisciplinaBody) {
    try {
      const payload: any = {};
      if (data.DisDescricao !== undefined)
        payload.DisDescricao = data.DisDescricao;
      if (data.DisAbreviatura !== undefined)
        payload.DisAbreviatura = data.DisAbreviatura;
      if (data.DisCor !== undefined) payload.DisCor = data.DisCor;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Disciplinas.update({
        where: { DisCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Disciplinas.delete({
        where: { DisCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar disciplina:", error);
      return null;
    }
  }
}
