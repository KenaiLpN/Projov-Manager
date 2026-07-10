import { prisma } from "../lib/prisma";
import { createWithNextId } from "../lib/nextId";
import {
  CreateOrientadorBody,
  UpdateOrientadorBody,
} from "../schemas/orientadorSchema";
export class OrientadorService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { OriNome: { contains: search } },
          { OriEmail: { contains: search } },
        ];
      }
      const [orientadores, total] = await Promise.all([
        prisma.cA_Orientador.findMany({
          where,
          orderBy: { OriCodigo: "asc" },
          skip,
          take: limit,
        }),
        prisma.cA_Orientador.count({ where }),
      ]);
      const unidadeIds = [
        ...new Set(
          orientadores.map((o: any) => o.OriUnidadeParceiro).filter(Boolean),
        ),
      ] as number[];
      const enriched = await Promise.all(
        orientadores.map(async (o: any) => {
          let UnidadeNome = null;
          let EmpresaNome = null;
          if (o.OriUnidadeParceiro) {
            const unidade = await prisma.cA_ParceirosUnidade.findFirst({
              where: { ParUniCodigo: o.OriUnidadeParceiro },
              select: { ParUniDescricao: true, ParUniCodigoParceiro: true },
            });
            if (unidade) {
              UnidadeNome = unidade.ParUniDescricao;
              const empresa = await prisma.cA_Parceiros.findFirst({
                where: { ParCodigo: unidade.ParUniCodigoParceiro },
                select: { ParDescricao: true },
              });
              if (empresa) {
                EmpresaNome = empresa.ParDescricao;
              }
            }
          }
          return { ...o, UnidadeNome, EmpresaNome };
        }),
      );
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
      console.error("Erro ao listar orientadores:", error);
      throw error;
    }
  }
  async create(data: CreateOrientadorBody) {
    try {
      return await createWithNextId("CA_Orientador", "OriCodigo", (tx, nextId) => tx.cA_Orientador.create({
        data: {
          OriCodigo: nextId,
          OriUnidadeParceiro: data.OriUnidadeParceiro,
          OriNome: data.OriNome,
          OriTelefone: data.OriTelefone || null,
          OriEmail: data.OriEmail || null,
        },
      }));
    } catch (error) {
      console.error("Erro ao criar orientador:", error);
      throw error;
    }
  }
  async update(id: number, data: UpdateOrientadorBody) {
    try {
      const payload: any = {};
      if (data.OriUnidadeParceiro !== undefined)
        payload.OriUnidadeParceiro = data.OriUnidadeParceiro;
      if (data.OriNome !== undefined) payload.OriNome = data.OriNome;
      if (data.OriTelefone !== undefined)
        payload.OriTelefone = data.OriTelefone;
      if (data.OriEmail !== undefined) payload.OriEmail = data.OriEmail;
      if (Object.keys(payload).length === 0) return null;
      return await prisma.cA_Orientador.update({
        where: { OriCodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar orientador:", error);
      return null;
    }
  }
  async delete(id: number) {
    try {
      await prisma.cA_Orientador.delete({
        where: { OriCodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir orientador:", error);
      return null;
    }
  }
}
