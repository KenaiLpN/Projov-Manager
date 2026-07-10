import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateUnidadeParceiroBody,
  UpdateUnidadeParceiroBody,
} from "../schemas/unidadeParceiroSchema";
export class UnidadeParceiroService {
  async getAll(
    page: number,
    limit: number,
    search?: string,
    empresaId?: number,
  ) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { ParUniDescricao: { contains: search } },
          { ParUniCNPJ: { contains: search } },
        ];
      }
      if (empresaId) {
        where.ParUniCodigoParceiro = empresaId;
      }
      const selectFields = {
        ParUniCodigo: true,
        ParUniCodigoParceiro: true,
        ParUniDescricao: true,
        ParUniCNPJ: true,
        ParUniEndereco: true,
        ParUniNumeroEndereco: true,
        ParUniComplemento: true,
        ParUniBairro: true,
        ParUniCidade: true,
        ParUniEstado: true,
        ParUniEmail: true,
        ParUniNomeContato: true,
      };
      const [unidades, total] = await Promise.all([
        prisma.cA_ParceirosUnidade.findMany({
          where,
          orderBy: { ParUniCodigo: "asc" },
          skip,
          take: limit,
          select: selectFields,
        }),
        prisma.cA_ParceirosUnidade.count({ where }),
      ]);
      const parceiroIds = [
        ...new Set(
          unidades.map((u: any) => u.ParUniCodigoParceiro).filter(Boolean),
        ),
      ] as number[];
      const parceiroMap = new Map<number, string>();
      if (parceiroIds.length > 0) {
        const parceiros = await prisma.cA_Parceiros.findMany({
          where: { ParCodigo: { in: parceiroIds } },
          select: { ParCodigo: true, ParDescricao: true },
        });
        parceiros.forEach((p: any) => {
          if (p.ParCodigo && p.ParDescricao) {
            parceiroMap.set(p.ParCodigo, p.ParDescricao);
          }
        });
      }
      const enriched = unidades.map((u: any) => ({
        ...u,
        EmpresaNome:
          u.ParUniCodigoParceiro && parceiroMap.has(u.ParUniCodigoParceiro)
            ? parceiroMap.get(u.ParUniCodigoParceiro)
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
      console.error("Erro ao listar unidades de parceiro:", error);
      throw error;
    }
  }
  async create(data: CreateUnidadeParceiroBody) {
    try {
      return await createWithNextId("CA_ParceirosUnidade", "ParUniCodigo", (tx, nextId) => tx.cA_ParceirosUnidade.create({
        data: {
          ParUniCodigo: nextId,
          ParUniCodigoParceiro: data.ParUniCodigoParceiro,
          ParUniDescricao: data.ParUniDescricao,
          ParUniCNPJ: data.ParUniCNPJ || null,
          ParUniEndereco: data.ParUniEndereco || null,
          ParUniNumeroEndereco: data.ParUniNumeroEndereco || null,
          ParUniComplemento: data.ParUniComplemento || null,
          ParUniBairro: data.ParUniBairro || null,
          ParUniCidade: data.ParUniCidade || null,
          ParUniEstado: data.ParUniEstado || null,
          ParUniEmail: data.ParUniEmail || null,
          ParUniNomeContato: data.ParUniNomeContato || null,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar unidade de parceiro:", error);
      throw error;
    }
  }
  async update(
    codigo: number,
    parceiroId: number,
    data: UpdateUnidadeParceiroBody,
  ) {
    try {
      const payload: any = {};
      if (data.ParUniDescricao !== undefined)
        payload.ParUniDescricao = data.ParUniDescricao;
      if (data.ParUniCNPJ !== undefined) payload.ParUniCNPJ = data.ParUniCNPJ;
      if (data.ParUniEndereco !== undefined)
        payload.ParUniEndereco = data.ParUniEndereco;
      if (data.ParUniNumeroEndereco !== undefined)
        payload.ParUniNumeroEndereco = data.ParUniNumeroEndereco;
      if (data.ParUniComplemento !== undefined)
        payload.ParUniComplemento = data.ParUniComplemento;
      if (data.ParUniBairro !== undefined)
        payload.ParUniBairro = data.ParUniBairro;
      if (data.ParUniCidade !== undefined)
        payload.ParUniCidade = data.ParUniCidade;
      if (data.ParUniEstado !== undefined)
        payload.ParUniEstado = data.ParUniEstado;
      if (data.ParUniEmail !== undefined)
        payload.ParUniEmail = data.ParUniEmail;
      if (data.ParUniNomeContato !== undefined)
        payload.ParUniNomeContato = data.ParUniNomeContato;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_ParceirosUnidade.update({
        where: { ParUniCodigo: codigo },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar unidade de parceiro:", error);
      return null;
    }
  }
  async delete(codigo: number, parceiroId: number) {
    try {
      await prisma.cA_ParceirosUnidade.delete({
        where: { ParUniCodigo: codigo },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar unidade de parceiro:", error);
      return null;
    }
  }
  async getById(codigo: number, parceiroId: number) {
    try {
      const unidade = await prisma.cA_ParceirosUnidade.findFirst({
        where: {
          ParUniCodigo: codigo,
          ParUniCodigoParceiro: parceiroId,
        },
        select: {
          ParUniCodigo: true,
          ParUniCodigoParceiro: true,
          ParUniDescricao: true,
          ParUniCNPJ: true,
          ParUniEndereco: true,
          ParUniNumeroEndereco: true,
          ParUniComplemento: true,
          ParUniBairro: true,
          ParUniCidade: true,
          ParUniEstado: true,
          ParUniEmail: true,
          ParUniNomeContato: true,
        },
      });
      return unidade || null;
    } catch (error) {
      console.error("Erro ao buscar unidade de parceiro:", error);
      return null;
    }
  }
}
