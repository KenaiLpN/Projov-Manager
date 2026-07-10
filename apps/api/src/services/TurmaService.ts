import { prisma } from "../lib/prisma";
import { CreateTurmaBody, UpdateTurmaBody } from "../schemas/turmaSchema";
export class TurmaService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { TurNome: { contains: search } },
          { TurCurso: { contains: search } },
        ];
      }
      const [turmas, total] = await Promise.all([
        prisma.cA_Turmas.findMany({
          where,
          orderBy: { TurCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Turmas.count({ where }),
      ]);
      return {
        data: turmas,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar turmas:", error);
      throw error;
    }
  }
  async create(data: CreateTurmaBody) {
    try {
      const maxTurma = await prisma.cA_Turmas.aggregate({
        _max: {
          TurCodigo: true,
        },
      });
      const nextId = (maxTurma._max.TurCodigo || 0) + 1;
      const payload: any = { TurCodigo: nextId };
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "TurInicio" || key === "Termino") {
            payload[key] = value ? new Date(value) : null;
          } else {
            payload[key] = value;
          }
        }
      });
      const newTurma = await prisma.cA_Turmas.create({
        data: payload,
      });
      return newTurma;
    } catch (error) {
      console.error("Erro ao criar turma:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateTurmaBody) {
    try {
      const payload: any = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "TurInicio" || key === "Termino") {
            payload[key] = value ? new Date(value) : null;
          } else {
            payload[key] = value;
          }
        }
      });
      if (Object.keys(payload).length > 0) {
        return await prisma.cA_Turmas.update({
          where: { TurCodigo: id },
          data: payload,
        });
      }
      return await prisma.cA_Turmas.findUnique({
        where: { TurCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao atualizar turma:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Turmas.delete({
        where: { TurCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar turma:", error);
      return null;
    }
  }
}
