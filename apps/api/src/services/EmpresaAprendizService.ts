import { prisma } from "../lib/prisma";

function dateOnly(value: Date | null | undefined) {
  return value?.toISOString().slice(0, 10) ?? null;
}

export class EmpresaAprendizService {
  private async getPartnerUnitIds(partnerId: number) {
    const units = await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigoParceiro: partnerId },
      select: { ParUniCodigo: true, ParUniDescricao: true },
    });

    return {
      ids: units.map((unit) => unit.ParUniCodigo),
      names: new Map(units.map((unit) => [unit.ParUniCodigo, unit.ParUniDescricao])),
    };
  }

  private async getAuthorizedAllocations(partnerId: number, apprenticeId?: number) {
    const units = await this.getPartnerUnitIds(partnerId);
    if (units.ids.length === 0) return { allocations: [], units };

    const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
      where: {
        ALAUnidadeParceiro: { in: units.ids },
        ...(apprenticeId ? { ALAAprendiz: apprenticeId } : {}),
      },
      orderBy: [{ ALAAprendiz: "asc" }, { ALAOrdem: "desc" }],
    });

    return { allocations, units };
  }

  async list(partnerId: number, page: number, limit: number, search?: string) {
    const { allocations, units } = await this.getAuthorizedAllocations(partnerId);
    if (allocations.length === 0) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const apprenticeIds = [...new Set(allocations.map((allocation) => allocation.ALAAprendiz))];
    const normalizedSearch = search?.trim();
    const apprentices = await prisma.cA_Aprendiz.findMany({
      where: {
        Apr_Codigo: { in: apprenticeIds.map(BigInt) },
        Apr_Situacao: BigInt(6),
        ...(normalizedSearch
          ? {
              OR: [
                { Apr_Nome: { contains: normalizedSearch } },
                { Apr_Codigo: /^\d+$/.test(normalizedSearch) ? BigInt(normalizedSearch) : undefined },
              ],
            }
          : {}),
      },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
        Apr_Situacao: true,
      },
    });

    const apprenticeMap = new Map(apprentices.map((apprentice) => [Number(apprentice.Apr_Codigo), apprentice]));
    const visibleAllocations = allocations.filter((allocation) => apprenticeMap.has(allocation.ALAAprendiz));
    const total = visibleAllocations.length;
    const start = (page - 1) * limit;
    const pageAllocations = visibleAllocations.slice(start, start + limit);
    const turmaIds = [...new Set(pageAllocations.map((allocation) => allocation.ALATurma))];
    const turmas = turmaIds.length
      ? await prisma.cA_Turmas.findMany({
          where: { TurCodigo: { in: turmaIds } },
          select: { TurCodigo: true, TurNome: true },
        })
      : [];
    const turmaNames = new Map(turmas.map((turma) => [turma.TurCodigo, turma.TurNome]));

    return {
      data: pageAllocations.map((allocation) => {
        const apprentice = apprenticeMap.get(allocation.ALAAprendiz)!;
        return {
          alocacaoOrdem: allocation.ALAOrdem,
          codigo: allocation.ALAAprendiz,
          nome: apprentice.Apr_Nome ?? "",
          turmaCodigo: allocation.ALATurma,
          turma: turmaNames.get(allocation.ALATurma) || `Turma ${allocation.ALATurma}`,
          unidade: units.names.get(allocation.ALAUnidadeParceiro) ?? "",
          situacao: "Em Aprendizagem",
          dataEntrada: dateOnly(allocation.ALADataInicio),
          dataPrevTermino: dateOnly(allocation.ALADataPrevTermino),
        };
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async details(partnerId: number, apprenticeId: number) {
    const { allocations, units } = await this.getAuthorizedAllocations(partnerId, apprenticeId);
    if (allocations.length === 0) return null;

    const apprentice = await prisma.cA_Aprendiz.findUnique({
      where: { Apr_Codigo: BigInt(apprenticeId) },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
        Apr_NomeSocial: true,
        Apr_DataDeNascimento: true,
        Apr_Sexo: true,
        Apr_CPF: true,
        Apr_Celular: true,
        Apr_Telefone: true,
        Apr_Email: true,
        Apr_Endereco: true,
        Apr_NumeroEndereco: true,
        Apr_Complemento: true,
        Apr_Bairro: true,
        Apr_Cidade: true,
        Apr_UF: true,
        Apr_CEP: true,
        Apr_NomeEscola: true,
        Apr_Escolaridade: true,
        Apr_TurnoEscolar: true,
        Apr_Situacao: true,
        Apr_TipoAprendizagem: true,
        Apr_HorasDiarias: true,
        Apr_DataContrato: true,
        Apr_InicioAprendizagem: true,
        Apr_PrevFimAprendizagem: true,
      },
    });
    if (!apprentice) return null;

    const turmaIds = [...new Set(allocations.map((allocation) => allocation.ALATurma))];
    const [turmas, documents, attendance] = await Promise.all([
      prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: turmaIds } },
        select: { TurCodigo: true, TurNome: true },
      }),
      prisma.cA_DocumentosAprendiz.findMany({
        where: { DAprMatricula: apprenticeId },
        orderBy: { DAprDataSolic: "desc" },
        take: 100,
      }),
      prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: { AdiCodAprendiz: apprenticeId, AdiTurma: { in: turmaIds } },
        orderBy: { AdiDataAula: "desc" },
        select: {
          AdiTurma: true,
          AdiDataAula: true,
          AdiCargaHoraria: true,
          AdiPresenca: true,
          AdiPresencaTarde: true,
          AdiObservacoes: true,
        },
      }),
    ]);

    const documentCodes = [...new Set(documents.map((document) => document.DAprDocumento))];
    const documentTypes = documentCodes.length
      ? await prisma.cA_Documentos.findMany({
          where: { DocCodigo: { in: documentCodes } },
          select: { DocCodigo: true, DocDescricao: true },
        })
      : [];
    const documentNames = new Map(documentTypes.map((document) => [document.DocCodigo, document.DocDescricao]));
    const turmaNames = new Map(turmas.map((turma) => [turma.TurCodigo, turma.TurNome]));
    const absences = attendance.reduce(
      (total, record) =>
        total + (record.AdiPresenca === "F" ? 1 : 0) + (record.AdiPresencaTarde === "F" ? 1 : 0),
      0,
    );
    const justified = attendance.reduce(
      (total, record) =>
        total + (record.AdiPresenca === "J" ? 1 : 0) + (record.AdiPresencaTarde === "J" ? 1 : 0),
      0,
    );

    return {
      apprentice: {
        ...apprentice,
        Apr_Codigo: Number(apprentice.Apr_Codigo),
        Apr_Situacao: apprentice.Apr_Situacao ? Number(apprentice.Apr_Situacao) : null,
        Apr_DataDeNascimento: dateOnly(apprentice.Apr_DataDeNascimento),
        Apr_DataContrato: dateOnly(apprentice.Apr_DataContrato),
        Apr_InicioAprendizagem: dateOnly(apprentice.Apr_InicioAprendizagem),
        Apr_PrevFimAprendizagem: dateOnly(apprentice.Apr_PrevFimAprendizagem),
        situacao: "Em Aprendizagem",
      },
      allocations: allocations.map((allocation) => ({
        ordem: allocation.ALAOrdem,
        turmaCodigo: allocation.ALATurma,
        turma: turmaNames.get(allocation.ALATurma) || `Turma ${allocation.ALATurma}`,
        unidade: units.names.get(allocation.ALAUnidadeParceiro) ?? "",
        status: allocation.ALAStatus,
        dataEntrada: dateOnly(allocation.ALADataInicio),
        dataPrevTermino: dateOnly(allocation.ALADataPrevTermino),
        dataTermino: dateOnly(allocation.ALADataTermino),
      })),
      documents: documents.map((document) => ({
        sequencia: document.DAprSequencia,
        codigo: document.DAprDocumento,
        documento: documentNames.get(document.DAprDocumento) || document.DAprDocumento,
        status: document.DAprStatus,
        dataSolicitacao: dateOnly(document.DAprDataSolic),
        dataEntrega: dateOnly(document.DAprDataEntrega),
        previsaoEntrega: dateOnly(document.DAprPrevEntrega),
        possuiAnexo: document.DAprDocAnexo === "S" || Boolean(document.AluNomeAnexo),
      })),
      attendance: {
        resumo: { registros: attendance.length, faltas: absences, justificadas: justified },
        registros: attendance.map((record) => ({
          turma: turmaNames.get(record.AdiTurma) || `Turma ${record.AdiTurma}`,
          data: dateOnly(record.AdiDataAula),
          cargaHoraria: record.AdiCargaHoraria,
          presenca: record.AdiPresenca,
          presencaTarde: record.AdiPresencaTarde,
          observacoes: record.AdiObservacoes,
        })),
      },
    };
  }

  async calendar(partnerId: number, apprenticeId: number) {
    const { allocations, units } = await this.getAuthorizedAllocations(partnerId, apprenticeId);
    if (allocations.length === 0) return null;

    const [apprentice, partner, dates] = await Promise.all([
      prisma.cA_Aprendiz.findUnique({
        where: { Apr_Codigo: BigInt(apprenticeId) },
        select: { Apr_Codigo: true, Apr_Nome: true },
      }),
      prisma.cA_Parceiros.findUnique({
        where: { ParCodigo: partnerId },
        select: { ParDescricao: true, ParNomeFantasia: true },
      }),
      prisma.cA_CalendarioJovem.findMany({
        where: { CLJCodigo: apprenticeId },
        orderBy: { CLJDataEncontro: "asc" },
        select: { CLJDataEncontro: true, CLJTipo: true },
      }),
    ]);
    if (!apprentice) return null;

    return {
      aprendiz: { codigo: Number(apprentice.Apr_Codigo), nome: apprentice.Apr_Nome ?? "" },
      empresa: partner?.ParNomeFantasia || partner?.ParDescricao || "",
      alocacoes: allocations.map((allocation) => ({
        turma: allocation.ALATurma,
        unidade: units.names.get(allocation.ALAUnidadeParceiro) ?? "",
        dataEntrada: dateOnly(allocation.ALADataInicio),
        dataPrevTermino: dateOnly(allocation.ALADataPrevTermino),
      })),
      dias: dates.map((date) => ({ data: dateOnly(date.CLJDataEncontro), tipo: date.CLJTipo })),
    };
  }
}
