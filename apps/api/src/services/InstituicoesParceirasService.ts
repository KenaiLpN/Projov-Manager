import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateInstituicaoParceiraBody,
  UpdateInstituicaoParceiraBody,
} from "../schemas/instituicoesParceirasSchema";
export class InstituicoesParceirasService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const whereClause = search
        ? {
            OR: [
              { IpaDescricao: { contains: search } },
              { IpaCidade: { contains: search } },
              { IpaBairro: { contains: search } },
              { IpaEmail: { contains: search } },
            ],
          }
        : undefined;
      const [parceiros, total] = await Promise.all([
        prisma.cA_InstituicoesParceiras.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { IpaCodigo: "asc" },
          select: {
            IpaCodigo: true,
            IpaDescricao: true,
            IpaEndereco: true,
            IpaNumeroEndereco: true,
            IpaComplemento: true,
            IpaBairro: true,
            IpaCidade: true,
            IpaEstado: true,
            IpaCEP: true,
            IpaEmail: true,
            IpaTelefone: true,
            IpaCelular: true,
            IpaNomeContato: true,
          },
        }),
        prisma.cA_InstituicoesParceiras.count({
          where: whereClause,
        }),
      ]);
      return {
        data: parceiros,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar instituições parceiras:", error);
      throw error;
    }
  }
  async create(data: CreateInstituicaoParceiraBody) {
    const created = await createWithNextId("CA_InstituicoesParceiras", "IpaCodigo", (tx, nextId) => tx.cA_InstituicoesParceiras.create({
      data: {
        IpaCodigo: nextId,
        IpaDescricao: data.IpaDescricao,
        IpaEndereco: data.IpaEndereco,
        IpaNumeroEndereco: data.IpaNumeroEndereco,
        IpaComplemento: data.IpaComplemento,
        IpaBairro: data.IpaBairro,
        IpaCidade: data.IpaCidade,
        IpaEstado: data.IpaEstado,
        IpaCEP: data.IpaCEP,
        IpaEmail: data.IpaEmail,
        IpaTelefone: data.IpaTelefone,
        IpaCelular: data.IpaCelular,
        IpaNomeContato: data.IpaNomeContato,
        IpaDataCadastro: new Date(),
      },
      select: {
        IpaCodigo: true,
        IpaDescricao: true,
        IpaEndereco: true,
        IpaNumeroEndereco: true,
        IpaComplemento: true,
        IpaBairro: true,
        IpaCidade: true,
        IpaEstado: true,
        IpaCEP: true,
        IpaEmail: true,
        IpaTelefone: true,
        IpaCelular: true,
        IpaNomeContato: true,
      },
    }));
    return created;
  }
  async update(id: number, data: UpdateInstituicaoParceiraBody) {
    try {
      const updated = await prisma.cA_InstituicoesParceiras.update({
        where: { IpaCodigo: id },
        data: {
          ...data,
          IpaDataAlteracao: new Date(),
        },
        select: {
          IpaCodigo: true,
          IpaDescricao: true,
          IpaEndereco: true,
          IpaNumeroEndereco: true,
          IpaComplemento: true,
          IpaBairro: true,
          IpaCidade: true,
          IpaEstado: true,
          IpaCEP: true,
          IpaEmail: true,
          IpaTelefone: true,
          IpaCelular: true,
          IpaNomeContato: true,
        },
      });
      return updated;
    } catch (error: any) {
      if (error?.code === "P2025") {
        return null;
      }
      console.error("Erro ao atualizar parceiro:", error);
      throw error;
    }
  }
  async delete(id: number) {
    try {
      return await prisma.cA_InstituicoesParceiras.delete({
        where: { IpaCodigo: id },
      });
    } catch (error) {
      console.error("Erro ao deletar parceiro:", error);
      return null;
    }
  }
}
