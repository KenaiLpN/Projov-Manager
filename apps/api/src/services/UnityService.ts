import { prisma } from "../lib/prisma";
import { CreateUnityBody, UpdateUnityBody } from "../schemas/unitySchema";
export class UnityService {
  async getById(id: number) {
    try {
      const unity = await prisma.cA_Unidades.findUnique({
        where: { UniCodigo: id },
      });
      return unity || null;
    } catch (error) {
      console.error("Erro ao buscar unidade por ID:", error);
      throw error;
    }
  }
  async getAllUnities(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { UniNome: { contains: search } },
          { UniCGC: { contains: search } },
          { UniRepresentanteLegal: { contains: search } },
        ];
      }
      const [unidades, total] = await Promise.all([
        prisma.cA_Unidades.findMany({
          where,
          orderBy: { UniCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Unidades.count({ where }),
      ]);
      return {
        data: unidades,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar unidades:", error);
      throw error;
    }
  }
  async createUnity(data: CreateUnityBody) {
    try {
      const maxUnity = await prisma.cA_Unidades.aggregate({
        _max: {
          UniCodigo: true,
        },
      });
      const nextId = (maxUnity._max.UniCodigo || 0) + 1;
      const payload: any = { UniCodigo: nextId };
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });
      const newUnity = await prisma.cA_Unidades.create({
        data: payload,
      });
      return newUnity;
    } catch (error) {
      console.error("Erro ao criar unidade:", error);
      throw error;
    }
  }
  async updateUnity(id: number, data: UpdateUnityBody) {
    try {
      const payload: any = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });
      if (Object.keys(payload).length > 0) {
        return await prisma.cA_Unidades.update({
          where: { UniCodigo: id },
          data: payload,
        });
      }
      return this.getById(id);
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error);
      return null;
    }
  }
  async deleteUnity(id: number) {
    try {
      return await prisma.cA_Unidades.delete({
        where: { UniCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao excluir unidade:", error);
      return null;
    }
  }
}
