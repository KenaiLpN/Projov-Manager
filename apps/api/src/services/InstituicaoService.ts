import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateInstituicaoBody,
  UpdateInstituicaoBody,
} from "../schemas/instituicaoSchema";
export class InstituicaoService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { EscNome: { contains: search } },
          { EscEmail: { contains: search } },
          { EscDiretor: { contains: search } },
        ];
      }
      const [instituicoes, total] = await Promise.all([
        prisma.cA_Escolas.findMany({
          where,
          orderBy: { EscCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Escolas.count({ where }),
      ]);
      return {
        data: instituicoes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao buscar instituições:", error);
      throw new Error("Erro ao buscar instituições.");
    }
  }
  async create(data: CreateInstituicaoBody) {
    if (data.EscEmail) {
      const emailExists = await prisma.cA_Escolas.findFirst({
        where: { EscEmail: data.EscEmail },
      });
      if (emailExists) {
        throw new Error("E-mail já cadastrado.");
      }
    }
    try {
      return await createWithNextId("CA_Escolas", "EscCodigo", (tx, nextId) => tx.cA_Escolas.create({
        data: {
          EscCodigo: nextId,
          EscNome: data.EscNome,
          EscEmail: data.EscEmail || null,
          EscTelefone: data.EscTelefone || null,
          EscCEP: data.EscCEP || null,
          EscEndereco: data.EscEndereco || null,
          EscNumeroEndereco: data.EscNumeroEndereco || null,
          EscBairro: data.EscBairro || null,
          EscCidade: data.EscCidade || null,
          EscEstado: data.EscEstado || null,
          EscComplemento: data.EscComplemento || null,
          EscDiretor: data.EscDiretor || null,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar instituição:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateInstituicaoBody) {
    try {
      const payload: any = {};
      if (data.EscNome !== undefined) payload.EscNome = data.EscNome;
      if (data.EscEmail !== undefined) payload.EscEmail = data.EscEmail;
      if (data.EscTelefone !== undefined)
        payload.EscTelefone = data.EscTelefone;
      if (data.EscCEP !== undefined) payload.EscCEP = data.EscCEP;
      if (data.EscEndereco !== undefined)
        payload.EscEndereco = data.EscEndereco;
      if (data.EscNumeroEndereco !== undefined)
        payload.EscNumeroEndereco = data.EscNumeroEndereco;
      if (data.EscBairro !== undefined) payload.EscBairro = data.EscBairro;
      if (data.EscCidade !== undefined) payload.EscCidade = data.EscCidade;
      if (data.EscEstado !== undefined) payload.EscEstado = data.EscEstado;
      if (data.EscComplemento !== undefined)
        payload.EscComplemento = data.EscComplemento;
      if (data.EscDiretor !== undefined) payload.EscDiretor = data.EscDiretor;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Escolas.update({
        where: { EscCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar instituição:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Escolas.delete({
        where: { EscCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar instituição:", error);
      return null;
    }
  }
}
