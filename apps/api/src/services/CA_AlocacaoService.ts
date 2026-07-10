import { prisma } from "../lib/prisma";

function fmtDate(v: any) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().substring(0, 10);
  return String(v).substring(0, 10);
}

function fmtDateBr(v: any) {
  const date = fmtDate(v);
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function fmtTime(v: any) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().substring(11, 16);
  return String(v).substring(11, 16);
}

function serialize(a: any) {
  return {
    ...a,
    ALADataInicio:           fmtDate(a.ALADataInicio),
    ALADataPrevTermino:      fmtDate(a.ALADataPrevTermino),
    ALADataTermino:          fmtDate(a.ALADataTermino),
    ALAInicioExpediente:     fmtTime(a.ALAInicioExpediente),
    ALATerminoExpediente:    fmtTime(a.ALATerminoExpediente),
    ALAUsuarioDataCadastro:  fmtDate(a.ALAUsuarioDataCadastro),
    ALAUsuarioDataAlteracao: fmtDate(a.ALAUsuarioDataAlteracao),
    ALADataMudaTurma:        fmtDate(a.ALADataMudaTurma),
  };
}

export class CA_AlocacaoService {
  async getFiltrosAtivos() {
    const [cursos, turmas] = await Promise.all([
      prisma.cA_Cursos.findMany({
        select: { CurCodigo: true, CurDescricao: true },
        orderBy: { CurCodigo: "asc" },
      }),
      prisma.cA_Turmas.findMany({
        select: { TurCodigo: true, TurNome: true, TurCurso: true },
        orderBy: [{ TurCurso: "asc" }, { TurCodigo: "asc" }],
      }),
    ]);

    return { cursos, turmas };
  }

  async getAprendizesAtivosPorTurma(turmaId: number) {
    const alocacoes = await prisma.cA_AlocacaoAprendiz.findMany({
      where: { ALATurma: turmaId, ALAStatus: "A" },
      select: {
        ALAAprendiz: true,
        ALAUnidadeParceiro: true,
        ALAAreaAtuacao: true,
        ALAOrdem: true,
      },
      orderBy: { ALAOrdem: "desc" },
    });

    if (alocacoes.length === 0) return [];

    const alocacaoMap = new Map<number, (typeof alocacoes)[number]>();
    for (const alocacao of alocacoes) {
      if (!alocacaoMap.has(alocacao.ALAAprendiz)) {
        alocacaoMap.set(alocacao.ALAAprendiz, alocacao);
      }
    }

    const aprendizIds = [...alocacaoMap.keys()];
    const aprendizes = await prisma.cA_Aprendiz.findMany({
      where: { Apr_Codigo: { in: aprendizIds.map(id => BigInt(id)) } },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
        Apr_Sexo: true,
        Apr_Telefone: true,
        Apr_Celular: true,
        Apr_Email: true,
        Apr_Situacao: true,
        Apr_AreaAtuacao: true,
      },
      orderBy: { Apr_Nome: "asc" },
    });

    const unidadeIds = [...new Set(alocacoes.map(a => a.ALAUnidadeParceiro))];
    const unidades = await prisma.cA_ParceirosUnidade.findMany({
      where: { ParUniCodigo: { in: unidadeIds } },
      select: { ParUniCodigo: true, ParUniCodigoParceiro: true, ParUniDescricao: true },
    });
    const unidadeMap = new Map(unidades.map(u => [u.ParUniCodigo, u]));

    const parceiroIds = [...new Set(unidades.map(u => u.ParUniCodigoParceiro))];
    const parceiros = await prisma.cA_Parceiros.findMany({
      where: { ParCodigo: { in: parceiroIds } },
      select: { ParCodigo: true, ParDescricao: true, ParNomeFantasia: true },
    });
    const parceiroMap = new Map(parceiros.map(p => [p.ParCodigo, p]));

    const areaIds = [...new Set(aprendizes.map(a => {
      const alocacao = alocacaoMap.get(Number(a.Apr_Codigo));
      return alocacao?.ALAAreaAtuacao ?? (a.Apr_AreaAtuacao ? Number(a.Apr_AreaAtuacao) : null);
    }).filter((id): id is number => id !== null))];
    const areas = areaIds.length
      ? await prisma.cA_AreaAtuacao.findMany({
          where: { AreaCodigo: { in: areaIds } },
          select: { AreaCodigo: true, AreaDescricao: true },
        })
      : [];
    const areaMap = new Map(areas.map(a => [a.AreaCodigo, a.AreaDescricao]));

    const situacaoIds = [...new Set(aprendizes.map(a => a.Apr_Situacao ? Number(a.Apr_Situacao) : null)
      .filter((id): id is number => id !== null))];
    const situacoes = situacaoIds.length
      ? await prisma.cA_SituacaoAprendiz.findMany({
          where: { StaCodigo: { in: situacaoIds } },
          select: { StaCodigo: true, StaAbreviatura: true },
        })
      : [];
    const situacaoMap = new Map(situacoes.map(s => [s.StaCodigo, s.StaAbreviatura]));

    return aprendizes.map(aprendiz => {
      const aprendizId = Number(aprendiz.Apr_Codigo);
      const alocacao = alocacaoMap.get(aprendizId)!;
      const unidade = unidadeMap.get(alocacao.ALAUnidadeParceiro);
      const parceiro = unidade ? parceiroMap.get(unidade.ParUniCodigoParceiro) : undefined;
      const areaId = alocacao.ALAAreaAtuacao ?? (aprendiz.Apr_AreaAtuacao ? Number(aprendiz.Apr_AreaAtuacao) : null);

      return {
        codigo: aprendizId,
        nome: aprendiz.Apr_Nome ?? "",
        sexo: aprendiz.Apr_Sexo ?? "",
        parceiro: parceiro?.ParNomeFantasia || parceiro?.ParDescricao || "",
        unidade: unidade?.ParUniDescricao ?? "",
        areaAtuacao: areaId ? areaMap.get(areaId) ?? "" : "",
        telefone: aprendiz.Apr_Telefone || aprendiz.Apr_Celular || "",
        situacao: aprendiz.Apr_Situacao ? situacaoMap.get(Number(aprendiz.Apr_Situacao)) ?? "" : "",
        email: aprendiz.Apr_Email ?? "",
      };
    });
  }

  async getAlunosPorTurma(turmaId: number) {
    const alocacoes = await prisma.cA_AlocacaoAprendiz.findMany({
      where: { ALATurma: turmaId },
      select: {
        ALAAprendiz: true,
        ALAOrdem: true,
      },
      orderBy: { ALAOrdem: "desc" },
    });

    const aprendizIds = new Set<number>();
    for (const alocacao of alocacoes) {
      aprendizIds.add(alocacao.ALAAprendiz);
    }

    const aprendizes = await prisma.cA_Aprendiz.findMany({
      where: {
        OR: [
          ...(aprendizIds.size > 0
            ? [{ Apr_Codigo: { in: [...aprendizIds].map(id => BigInt(id)) } }]
            : []),
          { Apr_Turma: turmaId },
          { Apr_TurmaCCI: turmaId },
          { Apr_TurmaENC: turmaId },
        ],
      },
      select: {
        Apr_Codigo: true,
        Apr_Nome: true,
        Apr_Situacao: true,
        Apr_DataDeNascimento: true,
        Apr_Sexo: true,
        Apr_Celular: true,
        Apr_Telefone: true,
        Apr_Email: true,
        Apr_Cidade: true,
      },
      orderBy: { Apr_Codigo: "asc" },
    });

    const situacaoIds = [...new Set(aprendizes.map(a => a.Apr_Situacao ? Number(a.Apr_Situacao) : null)
      .filter((id): id is number => id !== null))];
    const situacoes = situacaoIds.length
      ? await prisma.cA_SituacaoAprendiz.findMany({
          where: { StaCodigo: { in: situacaoIds } },
          select: { StaCodigo: true, StaDescricao: true },
        })
      : [];
    const situacaoMap = new Map(situacoes.map(s => [s.StaCodigo, s.StaDescricao]));

    return aprendizes.map(aprendiz => ({
      codigo: Number(aprendiz.Apr_Codigo),
      nome: aprendiz.Apr_Nome ?? "",
      situacao: aprendiz.Apr_Situacao ? situacaoMap.get(Number(aprendiz.Apr_Situacao)) ?? "" : "",
      nascimento: fmtDateBr(aprendiz.Apr_DataDeNascimento),
      sexo: aprendiz.Apr_Sexo ?? "",
      celular: aprendiz.Apr_Celular || aprendiz.Apr_Telefone || "",
      email: aprendiz.Apr_Email || "Não Informado.",
      cidade: aprendiz.Apr_Cidade ?? "",
    }));
  }

  async getByAprendiz(aprendizId: number) {
    const alocacoes = await prisma.cA_AlocacaoAprendiz.findMany({
      where: { ALAAprendiz: aprendizId },
      orderBy: { ALAOrdem: "desc" },
    });

    const turmaIds   = [...new Set(alocacoes.map(a => a.ALATurma))];
    const unidadeIds = [...new Set(alocacoes.map(a => a.ALAUnidadeParceiro))];

    const [turmas, unidades] = await Promise.all([
      turmaIds.length > 0
        ? prisma.cA_Turmas.findMany({ where: { TurCodigo: { in: turmaIds } }, select: { TurCodigo: true, TurNome: true } })
        : [],
      unidadeIds.length > 0
        ? prisma.cA_ParceirosUnidade.findMany({ where: { ParUniCodigo: { in: unidadeIds } }, select: { ParUniCodigo: true, ParUniDescricao: true } })
        : [],
    ]);

    const turmaMap   = new Map(turmas.map(t => [t.TurCodigo, t.TurNome]));
    const unidadeMap = new Map(unidades.map(u => [u.ParUniCodigo, u.ParUniDescricao]));

    return alocacoes.map(a => ({
      ...serialize(a),
      turmaNome:   turmaMap.get(a.ALATurma)            ?? null,
      unidadeNome: unidadeMap.get(a.ALAUnidadeParceiro) ?? null,
    }));
  }

  async create(aprendizId: number, data: any, userId: string) {
    const payload: any = {
      ALAAprendiz:            aprendizId,
      ALATurma:               Number(data.ALATurma),
      ALAUnidadeParceiro:     Number(data.ALAUnidadeParceiro),
      ALAStatus:              data.ALAStatus              ?? null,
      ALATutor:               data.ALATutor               ?? null,
      ALADataInicio:          data.ALADataInicio          ? new Date(data.ALADataInicio)         : null,
      ALADataPrevTermino:     data.ALADataPrevTermino     ? new Date(data.ALADataPrevTermino)     : null,
      ALADataTermino:         data.ALADataTermino         ? new Date(data.ALADataTermino)         : null,
      ALAInicioExpediente:    data.ALAInicioExpediente    ? new Date(`1970-01-01T${data.ALAInicioExpediente}:00`) : null,
      ALATerminoExpediente:   data.ALATerminoExpediente   ? new Date(`1970-01-01T${data.ALATerminoExpediente}:00`) : null,
      ALAValorBolsa:          data.ALAValorBolsa          ? Number(data.ALAValorBolsa)           : null,
      ALAValorTaxa:           data.ALAValorTaxa           ? Number(data.ALAValorTaxa)            : null,
      ALAValorEncargos:       data.ALAValorEncargos       ? Number(data.ALAValorEncargos)        : null,
      ALAObservacao:          data.ALAObservacao          ?? null,
      ALApagto:               data.ALApagto               ?? null,
      ALAOrientador:          data.ALAOrientador          ? Number(data.ALAOrientador)           : null,
      ALAMotivoDesligamento:  data.ALAMotivoDesligamento  ? Number(data.ALAMotivoDesligamento)   : null,
      ALAAreaAtuacao:         data.ALAAreaAtuacao         ? Number(data.ALAAreaAtuacao)          : null,
      ALATurmaAnterior:       data.ALATurmaAnterior       ? Number(data.ALATurmaAnterior)        : null,
      ALAUsuarioCadastro:     userId,
      ALAUsuarioDataCadastro: new Date(),
      ALAUsuarioAlteracao:    userId,
      ALAUsuarioDataAlteracao: new Date(),
    };

    const created = await prisma.cA_AlocacaoAprendiz.create({ data: payload });
    return serialize(created);
  }

  async update(ordem: number, data: any, userId: string) {
    const payload: any = {
      ALAUsuarioAlteracao:     userId,
      ALAUsuarioDataAlteracao: new Date(),
    };

    if (data.ALATurma            !== undefined) payload.ALATurma            = Number(data.ALATurma);
    if (data.ALAUnidadeParceiro  !== undefined) payload.ALAUnidadeParceiro  = Number(data.ALAUnidadeParceiro);
    if (data.ALAStatus           !== undefined) payload.ALAStatus           = data.ALAStatus;
    if (data.ALATutor            !== undefined) payload.ALATutor            = data.ALATutor;
    if (data.ALADataInicio       !== undefined) payload.ALADataInicio       = data.ALADataInicio       ? new Date(data.ALADataInicio)       : null;
    if (data.ALADataPrevTermino  !== undefined) payload.ALADataPrevTermino  = data.ALADataPrevTermino  ? new Date(data.ALADataPrevTermino)  : null;
    if (data.ALADataTermino      !== undefined) payload.ALADataTermino      = data.ALADataTermino      ? new Date(data.ALADataTermino)      : null;
    if (data.ALAInicioExpediente !== undefined) payload.ALAInicioExpediente = data.ALAInicioExpediente ? new Date(`1970-01-01T${data.ALAInicioExpediente}:00`) : null;
    if (data.ALATerminoExpediente !== undefined) payload.ALATerminoExpediente = data.ALATerminoExpediente ? new Date(`1970-01-01T${data.ALATerminoExpediente}:00`) : null;
    if (data.ALAValorBolsa       !== undefined) payload.ALAValorBolsa       = data.ALAValorBolsa       ? Number(data.ALAValorBolsa)       : null;
    if (data.ALAValorTaxa        !== undefined) payload.ALAValorTaxa        = data.ALAValorTaxa        ? Number(data.ALAValorTaxa)        : null;
    if (data.ALAValorEncargos    !== undefined) payload.ALAValorEncargos    = data.ALAValorEncargos    ? Number(data.ALAValorEncargos)    : null;
    if (data.ALAObservacao       !== undefined) payload.ALAObservacao       = data.ALAObservacao;
    if (data.ALApagto            !== undefined) payload.ALApagto            = data.ALApagto;
    if (data.ALAOrientador       !== undefined) payload.ALAOrientador       = data.ALAOrientador       ? Number(data.ALAOrientador)       : null;
    if (data.ALAMotivoDesligamento !== undefined) payload.ALAMotivoDesligamento = data.ALAMotivoDesligamento ? Number(data.ALAMotivoDesligamento) : null;
    if (data.ALAAreaAtuacao       !== undefined) payload.ALAAreaAtuacao       = data.ALAAreaAtuacao       ? Number(data.ALAAreaAtuacao)       : null;

    const updated = await prisma.cA_AlocacaoAprendiz.update({ where: { ALAOrdem: ordem }, data: payload });
    return serialize(updated);
  }

  async delete(ordem: number) {
    return prisma.cA_AlocacaoAprendiz.delete({ where: { ALAOrdem: ordem } });
  }
}
