import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateOccurrenceTypeBody,
  UpdateOccurrenceTypeBody,
} from "../schemas/occurrenceTypeSchema";
export class OccurrenceTypeService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OcoDescricao = { contains: search };
      }
      const [items, total] = await Promise.all([
        prisma.cA_Ocorrencias.findMany({
          where,
          orderBy: { OcoCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Ocorrencias.count({ where }),
      ]);
      return {
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar CA_Ocorrencias:", error);
      throw error;
    }
  }
  async create(data: CreateOccurrenceTypeBody) {
    try {
      return await createWithNextId("CA_Ocorrencias", "OcoCodigo", (tx, nextId) => tx.cA_Ocorrencias.create({
        data: {
          OcoCodigo: nextId,
          OcoDescricao: data.OcoDescricao || null,
          OcoTipo: data.OcoTipo || null,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar CA_Ocorrencias:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateOccurrenceTypeBody) {
    try {
      const payload: any = {};
      if (data.OcoDescricao !== undefined)
        payload.OcoDescricao = data.OcoDescricao || null;
      if (data.OcoTipo !== undefined) payload.OcoTipo = data.OcoTipo || null;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Ocorrencias.update({
        where: { OcoCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar CA_Ocorrencias:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Ocorrencias.delete({
        where: { OcoCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir CA_Ocorrencias:", error);
      return null;
    }
  }
}
