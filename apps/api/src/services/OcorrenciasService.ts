import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateOccurrenceBody,
  UpdateOccurrenceBody,
} from "../schemas/ocorrenciasSchema";
export class OccurrenceService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { OcoDescricao: { contains: search } },
          { OcoTipo: { contains: search } },
        ];
      }
      const [ocorrencias, total] = await Promise.all([
        prisma.cA_Ocorrencias.findMany({
          where,
          orderBy: { OcoCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Ocorrencias.count({ where }),
      ]);
      return {
        data: ocorrencias,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar ocorrências:", error);
      throw error;
    }
  }
  async create(data: CreateOccurrenceBody) {
    try {
      return await createWithNextId("CA_Ocorrencias", "OcoCodigo", (tx, nextId) => tx.cA_Ocorrencias.create({
        data: {
         OcoCodigo: data.OcoCodigo || nextId,
         OcoDescricao: data.OcoDescricao,
         OcoTipo: data.OcoTipo,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar ocorrência:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateOccurrenceBody) {
    try {
      const payload: any = {};
      if (data.OcoCodigo !== undefined)
        payload.OcoCodigo = data.OcoCodigo;
      if (data.OcoDescricao !== undefined)
        payload.OcoDescricao = data.OcoDescricao;
      if (data.OcoTipo !== undefined)
        payload.OcoTipo = data.OcoTipo; 
      return await prisma.cA_Ocorrencias.update({
        where: { OcoCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
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
      console.error("Erro ao excluir ocorrência:", error);
      return null;
    }
  }
}
