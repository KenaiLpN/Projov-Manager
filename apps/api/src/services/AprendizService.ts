import { prisma } from "../lib/prisma";
import { AprendizInput } from "../schemas/aprendizSchema";

export class AprendizService {
  async getAll(page: number, limit: number, search?: string, filter?: string, _advancedFilter?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      const searchAsInt = parseInt(search, 10);
      where.OR = [
        { Apr_Nome: { contains: search } },
        { Apr_CPF: { contains: search } },
        { Apr_Email: { contains: search } },
        ...(!isNaN(searchAsInt) ? [{ Apr_Codigo: BigInt(searchAsInt) }] : []),
      ];
    }

    if (filter === "working") {
      where.Apr_InstParceira = { not: null };
    } else if (filter === "available") {
      where.Apr_InstParceira = null;
    } else if (filter === "vacation") {
      const now = new Date();
      where.Apr_DataInicioFerias = { lte: now };
      where.Apr_DataTerminoFerias = { gte: now };
    }

    const [total, aprendizes] = await Promise.all([
      prisma.cA_Aprendiz.count({ where }),
      prisma.cA_Aprendiz.findMany({
        where,
        orderBy: { Apr_Codigo: "asc" },
        skip,
        take: limit,
        select: {
          Apr_Codigo: true,
          Apr_Nome: true,
          Apr_CPF: true,
          Apr_Situacao: true,
          Apr_InstParceira: true,
          Apr_Sexo: true,
          Apr_Telefone: true,
          Apr_Email: true,
        },
      }),
    ]);

    return {
      data: aprendizes.map(a => ({ ...a, Apr_Codigo: Number(a.Apr_Codigo) })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const now = new Date();
    const [total, vacation, working, available] = await Promise.all([
      prisma.cA_Aprendiz.count({ where: { Apr_Situacao: 8 } }),
      prisma.cA_Aprendiz.count({
        where: { Apr_DataInicioFerias: { lte: now }, Apr_DataTerminoFerias: { gte: now } },
      }),
      prisma.cA_Aprendiz.count({ where: { Apr_Situacao: 8, Apr_InstParceira: { not: null } } }),
      prisma.cA_Aprendiz.count({ where: { Apr_Situacao: 8, Apr_InstParceira: null } }),
    ]);
    return { total, vacation, working, available };
  }

  async create(_data: AprendizInput) {
    throw new Error("Use /ca-aprendiz endpoint instead.");
  }

  async getById(id: number) {
    const apr = await prisma.cA_Aprendiz.findUnique({ where: { Apr_Codigo: BigInt(id) } });
    if (!apr) return null;
    return { ...apr, Apr_Codigo: Number(apr.Apr_Codigo) };
  }

  async update(_id: number, _data: Partial<AprendizInput>) {
    throw new Error("Use /ca-aprendiz endpoint instead.");
  }

  async delete(id: number) {
    return await prisma.cA_Aprendiz.delete({ where: { Apr_Codigo: BigInt(id) } });
  }
}
