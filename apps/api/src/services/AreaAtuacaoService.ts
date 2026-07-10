import { prisma } from "../lib/prisma";
import {
  CreateAreaAtuacaoBody,
  UpdateAreaAtuacaoBody,
} from "../schemas/areaAtuacaoSchema";
export class AreaAtuacaoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.AreaDescricao = { contains: search };
      }
      const [areas, total] = await Promise.all([
        prisma.cA_AreaAtuacao.findMany({
          where,
          orderBy: { AreaCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_AreaAtuacao.count({ where }),
      ]);
      return {
        data: areas,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar áreas de atuação:", error);
      throw error;
    }
  }
  async create(data: CreateAreaAtuacaoBody) {
    try {
      const maxArea = await prisma.cA_AreaAtuacao.aggregate({
        _max: {
          AreaCodigo: true,
        },
      });
      const nextId = (maxArea._max.AreaCodigo || 0) + 1;
      const newArea = await prisma.cA_AreaAtuacao.create({
        data: {
          ...data,
          AreaCodigo: nextId,
        },
      });
      return newArea;
    } catch (error) {
      console.error("Erro ao criar área de atuação:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateAreaAtuacaoBody) {
    try {
      const payload: any = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });
      if (Object.keys(payload).length > 0) {
        return await prisma.cA_AreaAtuacao.update({
          where: { AreaCodigo: id },
          data: payload,
        });
      }
      return await prisma.cA_AreaAtuacao.findUnique({
        where: { AreaCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao atualizar área de atuação:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_AreaAtuacao.delete({
        where: { AreaCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar área de atuação:", error);
      return null;
    }
  }
}
