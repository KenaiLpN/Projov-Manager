import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateParceiroBody,
  UpdateParceiroBody,
} from "../schemas/parceiroSchema";
export class ParceiroService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { ParDescricao: { contains: search } },
          { ParNomeFantasia: { contains: search } },
          { ParCNPJ: { contains: search } },
        ];
      }
      const selectFields = {
        ParCodigo: true,
        ParDescricao: true,
        ParNomeFantasia: true,
        ParAtividadeId: true,
        ParCNPJ: true,
        ParEndereco: true,
        ParNumeroEndereco: true,
        ParComplemento: true,
        ParBairro: true,
        ParCidade: true,
        ParEstado: true,
        ParCEP: true,
        ParEmail: true,
        ParTelefone: true,
        ParCelular: true,
        ParSituacao: true,
        ParObservacoes: true,
        ParInscricao: true,
        ParInscricaoMunicipal: true,
      };
      const [parceiros, total] = await Promise.all([
        prisma.cA_Parceiros.findMany({
          where,
          orderBy: { ParCodigo: "asc" },
          skip,
          take: limit,
          select: selectFields,
        }),
        prisma.cA_Parceiros.count({ where }),
      ]);
      const ramoIds = [
        ...new Set(parceiros.map((p: any) => p.ParAtividadeId).filter(Boolean)),
      ] as number[];
      const ramoMap = new Map<number, string>();
      if (ramoIds.length > 0) {
        const ramos = await prisma.cadastroRamoAtividade.findMany({
          where: { IdRamo: { in: ramoIds } },
          select: { IdRamo: true, Descricao: true },
        });
        ramos.forEach((r) => {
          if (r.IdRamo && r.Descricao) {
            ramoMap.set(r.IdRamo, r.Descricao);
          }
        });
      }
      const enriched = parceiros.map((p: any) => ({
        ...p,
        RamoDescricao:
          p.ParAtividadeId && ramoMap.has(p.ParAtividadeId)
            ? ramoMap.get(p.ParAtividadeId)
            : null,
      }));
      return {
        data: enriched,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar parceiros:", error);
      throw error;
    }
  }
  async create(data: CreateParceiroBody) {
    try {
      return await createWithNextId("CA_Parceiros", "ParCodigo", (tx, nextId) => tx.cA_Parceiros.create({
        data: {
          ParCodigo: nextId,
          ParDescricao: data.ParDescricao,
          ParNomeFantasia: data.ParNomeFantasia || null,
          ParAtividadeId: data.ParAtividadeId,
          ParCNPJ: data.ParCNPJ || null,
          ParEndereco: data.ParEndereco || null,
          ParNumeroEndereco: data.ParNumeroEndereco || null,
          ParComplemento: data.ParComplemento || null,
          ParBairro: data.ParBairro || null,
          ParCidade: data.ParCidade || null,
          ParEstado: data.ParEstado || null,
          ParCEP: data.ParCEP || null,
          ParEmail: data.ParEmail || null,
          ParTelefone: data.ParTelefone || null,
          ParCelular: data.ParCelular || null,
          ParSituacao: data.ParSituacao || null,
          ParObservacoes: data.ParObservacoes || null,
          ParInscricao: data.ParInscricao || null,
          ParInscricaoMunicipal: data.ParInscricaoMunicipal || null,
          ParDataCadastro: new Date().toISOString(),
          ParDataAlteracao: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Erro ao criar parceiro:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateParceiroBody) {
    try {
      const payload: any = {};
      if (data.ParDescricao !== undefined)
        payload.ParDescricao = data.ParDescricao;
      if (data.ParNomeFantasia !== undefined)
        payload.ParNomeFantasia = data.ParNomeFantasia;
      if (data.ParAtividadeId !== undefined)
        payload.ParAtividadeId = data.ParAtividadeId;
      if (data.ParCNPJ !== undefined) payload.ParCNPJ = data.ParCNPJ;
      if (data.ParEndereco !== undefined)
        payload.ParEndereco = data.ParEndereco;
      if (data.ParNumeroEndereco !== undefined)
        payload.ParNumeroEndereco = data.ParNumeroEndereco;
      if (data.ParComplemento !== undefined)
        payload.ParComplemento = data.ParComplemento;
      if (data.ParBairro !== undefined) payload.ParBairro = data.ParBairro;
      if (data.ParCidade !== undefined) payload.ParCidade = data.ParCidade;
      if (data.ParEstado !== undefined) payload.ParEstado = data.ParEstado;
      if (data.ParCEP !== undefined) payload.ParCEP = data.ParCEP;
      if (data.ParEmail !== undefined) payload.ParEmail = data.ParEmail;
      if (data.ParTelefone !== undefined)
        payload.ParTelefone = data.ParTelefone;
      if (data.ParCelular !== undefined) payload.ParCelular = data.ParCelular;
      if (data.ParSituacao !== undefined)
        payload.ParSituacao = data.ParSituacao;
      if (data.ParObservacoes !== undefined)
        payload.ParObservacoes = data.ParObservacoes;
      if (data.ParInscricao !== undefined)
        payload.ParInscricao = data.ParInscricao;
      if (data.ParInscricaoMunicipal !== undefined)
        payload.ParInscricaoMunicipal = data.ParInscricaoMunicipal;
      if (Object.keys(payload).length === 0) return null;
      payload.ParDataAlteracao = new Date().toISOString();
      return await prisma.cA_Parceiros.update({
        where: { ParCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar parceiro:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Parceiros.delete({
        where: { ParCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar parceiro:", error);
      return null;
    }
  }
  async getById(id: number) {
    try {
      const parceiro = await prisma.cA_Parceiros.findUnique({
        where: { ParCodigo: id },
        select: {
          ParCodigo: true,
          ParDescricao: true,
          ParNomeFantasia: true,
          ParAtividadeId: true,
          ParCNPJ: true,
          ParEndereco: true,
          ParNumeroEndereco: true,
          ParComplemento: true,
          ParBairro: true,
          ParCidade: true,
          ParEstado: true,
          ParCEP: true,
          ParEmail: true,
          ParTelefone: true,
          ParCelular: true,
          ParSituacao: true,
          ParObservacoes: true,
          ParInscricao: true,
          ParInscricaoMunicipal: true,
        },
      });
      return parceiro || null;
    } catch (error) {
      console.error("Erro ao buscar parceiro por ID:", error);
      return null;
    }
  }
}
