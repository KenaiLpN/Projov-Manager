import { prisma } from "../lib/prisma";
import { CreateFeriadoBody, UpdateFeriadoBody } from "../schemas/feriadoSchema";
export class FeriadoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { FerDescricao: { contains: search } },
          { FerTipo: { contains: search } },
        ];
      }
      const [feriados, total] = await Promise.all([
        prisma.cA_Feriados.findMany({
          where,
          orderBy: { FerData: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Feriados.count({ where }),
      ]);
      return {
        data: feriados,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar feriados:", error);
      throw error;
    }
  }
  async create(data: CreateFeriadoBody) {
    try {
      const maxOrdem = await prisma.cA_Feriados.aggregate({
        _max: {
          FerOrdem: true,
        },
      });
      const nextId = (maxOrdem._max.FerOrdem || 0) + 1;
      
      const fString = data.FerData instanceof Date
        ? data.FerData.toISOString().split("T")[0]
        : data.FerData;

      const newFeriado = await prisma.cA_Feriados.create({
        data: {
          FerOrdem: nextId,
          FerUnidade: data.FerUnidade,
          FerData: fString,
          FerDescricao: data.FerDescricao || null,
          FerTipo: data.FerTipo || null,
        },
      });
      return newFeriado;
    } catch (error) {
      console.error("Erro ao criar feriado:", error);
      throw error;
    }
  }

  async update(
    params: { unidade: number; data: string },
    body: UpdateFeriadoBody,
  ) {
    try {
      const existing = await prisma.cA_Feriados.findUnique({
        where: {
          FerUnidade_FerData: {
            FerUnidade: params.unidade,
            FerData: params.data,
          },
        },
      });
      if (!existing) return null;
      
      const updateData: any = {};
      if (body.FerUnidade !== undefined) updateData.FerUnidade = body.FerUnidade;
      if (body.FerDescricao !== undefined) updateData.FerDescricao = body.FerDescricao;
      if (body.FerTipo !== undefined) updateData.FerTipo = body.FerTipo;
      if (body.FerData !== undefined) {
        updateData.FerData = body.FerData instanceof Date 
          ? body.FerData.toISOString().split("T")[0] 
          : body.FerData;
      }

      const updated = await prisma.cA_Feriados.update({
        where: { FerOrdem: existing.FerOrdem },
        data: updateData,
      });
      return updated;
    } catch (error) {
      console.error("Erro ao atualizar feriado:", error);
      return null;
    }
  }

  async delete(params: { unidade: number; data: string }) {
    try {
      await prisma.cA_Feriados.delete({
        where: {
          FerUnidade_FerData: {
            FerUnidade: params.unidade,
            FerData: params.data,
          },
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir feriado:", error);
      return null;
    }
  }
}

