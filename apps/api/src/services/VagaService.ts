import { prisma } from "../lib/prisma";
import { CreateVagaBody, UpdateVagaBody } from "../schemas/vagaSchema";

type VagaRecord = {
  ReqId: number;
  ReqEmpresa: number;
  ReqDataSolita__o?: string | null;
  ReqQuantidade: number;
  ReqSexo: string | null;
  ReqHorarioEntrevista: string | null;
  ReqSubstituicao: string | null;
  ReqCaracteristicasPessoais: string | null;
  ReqAreaAtuacao: number;
  ReqHabilidades: string | null;
  ReqAtividades: string | null;
  ReqContaoEntrevista: string | null;
  ReqObservacoes: string | null;
  ReqSituacao: string | null;
  ReqObservacoesInst: string | null;
  ReqBeneficios: string | null;
  ReqSalario: number | null;
  ReqHorarioTrabalho: string | null;
  ReqUsuarioCadastro: string | null;
  ReqDataCadastro: string | null;
  ReqUsuarioFechamento: string | null;
  ReqDataFechamento: string | null;
  ReqDadosFechamento: string | null;
  ReqSubstituir: string | null;
  ReqDataEntrevista: string | null;
  ReqEndEntrevista: string | null;
  ReqMaiorMenor: string | null;
  ReqIdadeMinima: number | null;
};

function normalizeVaga(row: VagaRecord) {
  return {
    ...row,
    ReqDataSolita__o: row.ReqDataSolita__o ?? null,
  };
}

function buildWhere(search?: string, empresaId?: number) {
  return {
    ...(empresaId ? { ReqEmpresa: empresaId } : {}),
    ...(search
      ? {
          OR: [
            { ReqCaracteristicasPessoais: { contains: search } },
            { ReqHabilidades: { contains: search } },
            { ReqAtividades: { contains: search } },
            { ReqEndEntrevista: { contains: search } },
          ],
        }
      : {}),
  };
}

export class VagaService {
  async getAll(page = 1, limit = 10, search?: string, empresaId?: number) {
    const skip = (page - 1) * limit;
    const where = buildWhere(search, empresaId);

    const [rows, total] = await Promise.all([
      prisma.cA_RequisicoesVagas.findMany({
        where,
        orderBy: { ReqId: "desc" },
        skip,
        take: limit,
      }),
      prisma.cA_RequisicoesVagas.count({ where }),
    ]);

    return {
      data: rows.map(normalizeVaga),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getById(id: number) {
    const row = await prisma.cA_RequisicoesVagas.findUnique({
      where: { ReqId: id },
    });
    return row ? normalizeVaga(row) : null;
  }

  async getByIdForPartner(id: number, partnerId: number) {
    const row = await prisma.cA_RequisicoesVagas.findFirst({
      where: { ReqId: id, ReqEmpresa: partnerId },
    });
    return row ? normalizeVaga(row) : null;
  }

  async create(data: CreateVagaBody) {
    const created = await prisma.cA_RequisicoesVagas.create({
      data: {
        ReqEmpresa: data.ReqEmpresa,
        ReqDataSolita__o: data.ReqDataSolita__o,
        ReqQuantidade: data.ReqQuantidade,
        ReqSexo: data.ReqSexo ?? null,
        ReqHorarioEntrevista: data.ReqHorarioEntrevista ?? null,
        ReqSubstituicao: data.ReqSubstituicao,
        ReqCaracteristicasPessoais: data.ReqCaracteristicasPessoais ?? null,
        ReqAreaAtuacao: data.ReqAreaAtuacao,
        ReqHabilidades: data.ReqHabilidades ?? null,
        ReqAtividades: data.ReqAtividades ?? null,
        ReqContaoEntrevista: data.ReqContaoEntrevista ?? null,
        ReqObservacoes: data.ReqObservacoes ?? null,
        ReqSituacao: data.ReqSituacao ?? null,
        ReqObservacoesInst: data.ReqObservacoesInst ?? null,
        ReqBeneficios: data.ReqBeneficios ?? null,
        ReqSalario: data.ReqSalario ?? null,
        ReqHorarioTrabalho: data.ReqHorarioTrabalho ?? null,
        ReqDataCadastro: new Date().toISOString(),
        ReqSubstituir: data.ReqSubstituir ?? null,
        ReqDataEntrevista: data.ReqDataEntrevista ?? null,
        ReqEndEntrevista: data.ReqEndEntrevista ?? null,
        ReqMaiorMenor: data.ReqMaiorMenor ?? null,
        ReqIdadeMinima: data.ReqIdadeMinima ?? null,
      },
    });

    return normalizeVaga(created);
  }

  async update(id: number, data: UpdateVagaBody) {
    const existing = await this.getById(id);
    if (!existing) return null;

    if (Object.values(data).every((value) => value === undefined)) {
      return existing;
    }

    const updated = await prisma.cA_RequisicoesVagas.update({
      where: { ReqId: id },
      data,
    });

    return normalizeVaga(updated);
  }

  async delete(id: number) {
    const existing = await this.getById(id);
    if (!existing) return null;

    await prisma.cA_RequisicoesVagas.delete({
      where: { ReqId: id },
    });

    return existing;
  }
}
