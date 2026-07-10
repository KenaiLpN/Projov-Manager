import { prisma } from "../lib/prisma";
import {
  CreateCadastroRamoAtividadeBody,
  UpdateCadastroRamoAtividadeBody,
} from "../schemas/cadastroRamoAtividadeSchema";
export class CadastroRamoAtividadeService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.RatDescricao = { contains: search };
      }
      const [ramos, total] = await Promise.all([
        prisma.cA_RamosAtividades.findMany({
          where,
          orderBy: { RatCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_RamosAtividades.count({ where }),
      ]);

      // Mapear para manter compatibilidade com o frontend
      // Mapear para manter compatibilidade com o frontend
      const mappedRamos = ramos.map(r => ({
        IdRamo: r.RatCodigo,
        Descricao: r.RatDescricao,
        CodigoCNAE: null,
        Observacao: null,
        Ativo: true,
        DataInclusao: null,
      }));


      return {
        data: mappedRamos,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao buscar ramos de atividade:", error);
      throw new Error("Erro ao buscar ramos de atividade.");
    }
  }

  async create(data: CreateCadastroRamoAtividadeBody) {
    try {
      const newItem = await prisma.cA_RamosAtividades.create({
        data: {
          RatDescricao: data.Descricao,
        },
      });
      return {
        IdRamo: newItem.RatCodigo,
        Descricao: newItem.RatDescricao,
      };
    } catch (error) {
      console.error("Erro ao criar ramo de atividade:", error);
      throw error;
    }
  }

  async update(id: number, data: UpdateCadastroRamoAtividadeBody) {
    try {
      if (data.Descricao === undefined) return null;
      const updated = await prisma.cA_RamosAtividades.update({
        where: { RatCodigo: id },
        data: { RatDescricao: data.Descricao },
      });
      return {
        IdRamo: updated.RatCodigo,
        Descricao: updated.RatDescricao,
      };
    } catch (error) {
      console.error("Erro ao atualizar ramo de atividade:", error);
      return null;
    }
  }

  async delete(id: number) {
    try {
      await prisma.cA_RamosAtividades.delete({
        where: { RatCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar ramo de atividade:", error);
      return null;
    }
  }
}
