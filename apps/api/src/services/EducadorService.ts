import { prisma } from "../lib/prisma";
import { CreateEducadorBody, UpdateEducadorBody } from "../schemas/educadorSchema";

function serializeEducador(record: any) {
  if (!record) return null;
  const result = { ...record };
  delete result.EducSenha;
  return result;
}

function withoutPassword<T extends CreateEducadorBody | UpdateEducadorBody>(data: T) {
  const result = { ...data };
  delete result.EducSenha;
  return result;
}

export class EducadorService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      
      if (search) {
        where.OR = [
          { EducNome: { contains: search, mode: 'insensitive' } },
          { EducCPF: { contains: search, mode: 'insensitive' } },
          { EducEMail: { contains: search, mode: 'insensitive' } },
          { EducNumSistInterno: { contains: search, mode: 'insensitive' } },
        ];

      }

      console.log("DEBUG - Iniciando busca de educadores. Where:", JSON.stringify(where));
      
      const total = await prisma.cA_Educadores.count({ where });
      console.log("DEBUG - Contagem concluída:", total);

      const educadores = await prisma.cA_Educadores.findMany({
        where,
        orderBy: { EducCodigo: "asc" },
        skip,
        take: limit,
      });
      console.log("DEBUG - Busca findMany concluída. Resultados:", educadores.length);


      return {
        data: educadores.map(serializeEducador),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao carregar educadores:", error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const record = await prisma.cA_Educadores.findUnique({
        where: { EducCodigo: id },
      });
      return serializeEducador(record);
    } catch (error) {
      console.error("Erro ao buscar educador por ID:", error);
      throw error;
    }
  }

  async create(data: CreateEducadorBody) {
    try {
      // Obter o próximo ID se necessário (EducCodigo é @id @default(autoincrement()))
      return await prisma.cA_Educadores.create({
        data: withoutPassword(data),
      });
    } catch (error) {
      console.error("Erro ao criar educador:", error);
      throw error;
    }
  }

  async update(id: number, data: UpdateEducadorBody) {
    try {
      return await prisma.cA_Educadores.update({
        where: { EducCodigo: id },
        data: withoutPassword(data),
      });
    } catch (error) {
      console.error("Erro ao atualizar educador:", error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await prisma.cA_Educadores.delete({
        where: { EducCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar educador:", error);
      throw error;
    }
  }
}
