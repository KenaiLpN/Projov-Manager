import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import { CreateFuncaoSistemaBody, UpdateFuncaoSistemaBody } from "../schemas/funcaoSistemaSchema";

export class FuncaoSistemaService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { FunSDescricao: { contains: search } },
          { FunSNomeForm: { contains: search } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.cA_funcoesSistema.findMany({
          where,
          skip,
          take: limit,
          orderBy: { FunSCodigo: "asc" },
        }),
        prisma.cA_funcoesSistema.count({ where }),
      ]);

      return {
        data,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Erro ao buscar funções do sistema:", error);
      throw error;
    }
  }

  async create(data: CreateFuncaoSistemaBody) {
    try {
      return await createWithNextId("CA_funcoesSistema", "FunSCodigo", (tx, nextId) => tx.cA_funcoesSistema.create({
        data: {
          ...data,
          FunSCodigo: nextId,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar função do sistema:", error);
      throw error;
    }
  }

  async update(id: number, data: UpdateFuncaoSistemaBody) {
    try {
      return await prisma.cA_funcoesSistema.update({
        where: { FunSCodigo: id },
        data,
      });
    } catch (error) {
      console.error("Erro ao atualizar função do sistema:", error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await prisma.cA_funcoesSistema.delete({
        where: { FunSCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao deletar função do sistema:", error);
      throw error;
    }
  }
}
