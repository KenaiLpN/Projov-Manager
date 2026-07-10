import { prisma } from "../lib/prisma";
import { CaAprendizInput } from "../schemas/CA_AprendizSchema";
import bcrypt from "bcryptjs";

// Campos BigInt no schema Prisma — precisam ser convertidos antes de inserir/atualizar
const BIGINT_FIELDS = ["Apr_Situacao", "Apr_NumeroFamiliares", "Apr_Unidade"] as const;

// BigInt não serializa para JSON nativamente — converte para Number nas respostas
function serializeAprendiz(record: any) {
  if (!record) return null;
  const out: any = { ...record };
  const allBigIntFields = ["Apr_Codigo", ...BIGINT_FIELDS];
  allBigIntFields.forEach(f => { if (typeof out[f] === "bigint") out[f] = Number(out[f]); });
  if (out.Apr_senha) out.Apr_senha = "";
  return out;
}

// Garante que campos BigInt do Prisma recebam BigInt (não Number)
function applyBigIntFields(payload: any) {
  BIGINT_FIELDS.forEach(f => {
    if (payload[f] !== undefined && payload[f] !== null) {
      payload[f] = BigInt(payload[f]);
    }
  });
}

export class CA_AprendizService {
  async getAll(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
    advancedFilter?: string,
  ) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};

      if (search) {
        where.OR = [
          { Apr_Nome: { contains: search } },
          { Apr_CPF:  { contains: search } },
          { Apr_Email: { contains: search } },
        ];
      }

      if (filter) {
        if (filter === "active") {
          where.Apr_Situacao = Number(8);
        }
        if (filter === "inscritos") {
          where.Apr_Situacao = Number(7);
        }
        if (filter === "habilitados") {
          where.Apr_Situacao = Number(1);          
        }
        if (filter === "desligados") {
          where.Apr_Situacao = { in: [Number(2),Number(3),Number(4),Number(5),] };          
        }
        if (filter === "aprendizagem") {
          where.Apr_Situacao = Number(6);
        }
        if (filter === "inscritosinternet") {
          where.Apr_Situacao = Number(12);
        }
        if (filter === "aprovados") {
          where.Apr_Situacao = Number(16);
        }
        if (filter === "naohabilitados") {
          where.Apr_Situacao = Number(14);
        }
      }

      if (advancedFilter) {
        try {
          const adv = JSON.parse(advancedFilter);
          if (adv.Codigo)           where.Apr_Codigo = BigInt(adv.Codigo);
          if (adv.Nome)             where.Apr_Nome = { contains: adv.Nome };
          if (adv.CPF)              where.Apr_CPF = { contains: adv.CPF };
          if (adv.NomeSocial)       where.Apr_NomeSocial = { contains: adv.NomeSocial };
          if (adv.Empresa)          where.Apr_Empresa = { contains: adv.Empresa };
          if (adv.NomeMae)          where.Apr_NomeMae = { contains: adv.NomeMae };
          if (adv.NomePai)          where.Apr_NomePai = { contains: adv.NomePai };
          if (adv.CBO)              where.Apr_CBO = { contains: adv.CBO };
          if (adv.NumSistExterno)   where.Apr_NumSistExterno = { contains: adv.NumSistExterno };
          if (adv.NomeEscola)       where.Apr_NomeEscola = { contains: adv.NomeEscola };

          if (adv.Turma)            where.Apr_Turma = Number(adv.Turma);
          if (adv.TurmaCCI)         where.Apr_TurmaCCI = Number(adv.TurmaCCI);
          if (adv.TurmaENC)         where.Apr_TurmaENC = Number(adv.TurmaENC);
          if (adv.Unidade)          where.Apr_Unidade = BigInt(adv.Unidade);
          if (adv.InstParceira)     where.Apr_InstParceira = Number(adv.InstParceira);
          if (adv.AreaAtuacao)      where.Apr_AreaAtuacao = Number(adv.AreaAtuacao);
          if (adv.PlanoCurricular)  where.Apr_PlanoCurricular = Number(adv.PlanoCurricular);
          if (adv.Escola)           where.AprCodEscola = Number(adv.Escola);
          if (adv.MotivoDesligamento) where.AprMotivoDesligamento1 = Number(adv.MotivoDesligamento);

          if (adv.Sexo)             where.Apr_Sexo = adv.Sexo;
          if (adv.EstadoCivil)      where.AprEstadoCivil = adv.EstadoCivil;
          if (adv.Exercito)         where.Apr_Exercito = adv.Exercito;
          if (adv.Escolaridade)     where.Apr_Escolaridade = adv.Escolaridade;
          if (adv.TipoAprendizagem) where.Apr_TipoAprendizagem = adv.TipoAprendizagem;
          if (adv.TipoContrato)     where.Apr_TipoContrato = adv.TipoContrato;
          if (adv.Estudante)        where.Apr_Estudante = adv.Estudante;
          if (adv.TurnoEscolar)     where.Apr_TurnoEscolar = adv.TurnoEscolar;
          if (adv.Piercing)         where.Apr_Piercing = adv.Piercing;
          if (adv.Tatuagem)         where.Apr_Tatuagem = adv.Tatuagem;
          if (adv.Deficiencia)      where.Apr_Deficiencia = adv.Deficiencia === "sim" ? { not: null } : null;

          if (adv.Municipio)        where.Apr_Cidade = { contains: adv.Municipio };
          if (adv.Bairro)           where.Apr_Bairro = { contains: adv.Bairro };
          if (adv.StatusAprendiz)   where.Apr_Situacao = BigInt(adv.StatusAprendiz);

          const dateRange = (f: string, t: string, field: string) => {
            if (!adv[f] && !adv[t]) return;
            const dr: any = {};
            if (adv[f]) dr.gte = new Date(adv[f]);
            if (adv[t]) dr.lte = new Date(adv[t]);
            where[field] = dr;
          };
          dateRange("DataContratoDe",         "DataContratoAte",         "Apr_DataContrato");
          dateRange("DataInicioEmpresaDe",     "DataInicioEmpresaAte",    "Apr_DataInicioEmpresa");
          dateRange("InicioAprendizagemDe",    "InicioAprendizagemAte",   "Apr_InicioAprendizagem");
          dateRange("FimAprendizagemDe",       "FimAprendizagemAte",      "Apr_FimAprendizagem");
          dateRange("PrevFimAprendizagemDe",   "PrevFimAprendizagemAte",  "Apr_PrevFimAprendizagem");

          if (adv.IdadeDe || adv.IdadeAte) {
            const now = new Date();
            const birthWhere: any = {};
            if (adv.IdadeDe) {
              birthWhere.lte = new Date(now.getFullYear() - Number(adv.IdadeDe), now.getMonth(), now.getDate());
            }
            if (adv.IdadeAte) {
              birthWhere.gte = new Date(now.getFullYear() - Number(adv.IdadeAte) - 1, now.getMonth(), now.getDate() + 1);
            }
            where.Apr_DataDeNascimento = birthWhere;
          }
        } catch (e) {
          console.error("Invalid advancedFilter JSON", e);
        }
      }

      const [total, aprendizes] = await Promise.all([
        prisma.cA_Aprendiz.count({ where }),
        prisma.cA_Aprendiz.findMany({
          where,
          orderBy: { Apr_Codigo: "asc" },
          skip,
          take: limit,
          select: {
            Apr_Codigo:           true,
            Apr_Nome:             true,
            Apr_CPF:              true,
            Apr_Situacao:         true,
            Apr_Unidade:          true,
            Apr_InstParceira:     true,
            Apr_Turma:            true,
            Apr_DataDeNascimento: true,
            Apr_Celular:          true,
            Apr_Telefone:         true,
            Apr_Cidade:           true,
            Apr_Sexo:             true,
            Apr_Email:            true,
          },
        }),
      ]);

      // Enriquecer com nome da unidade
      const unidadeIds = [...new Set(
        aprendizes.map(a => a.Apr_Unidade).filter(Boolean)
      )] as bigint[];

      const unidadeMap = new Map<number, string>();
      if (unidadeIds.length > 0) {
        const unidades = await prisma.cA_Unidades.findMany({
          where: { UniCodigo: { in: unidadeIds.map(Number) } },
          select: { UniCodigo: true, UniNome: true },
        });
        unidades.forEach(u => { if (u.UniNome) unidadeMap.set(u.UniCodigo, u.UniNome); });
      }

      // Enriquecer com descrição da situação
      const situacaoIds = [...new Set(
        aprendizes.map(a => a.Apr_Situacao).filter(Boolean)
      )] as bigint[];

      const situacaoMap = new Map<number, string>();
      if (situacaoIds.length > 0) {
        const situacoes = await prisma.cA_SituacaoAprendiz.findMany({
          where: { StaCodigo: { in: situacaoIds.map(Number) } },
          select: { StaCodigo: true, StaDescricao: true },
        });
        situacoes.forEach(s => { if (s.StaDescricao) situacaoMap.set(s.StaCodigo, s.StaDescricao); });
      }

      const data = aprendizes.map(a => ({
        ...serializeAprendiz(a),
        unidadeNome:     a.Apr_Unidade  ? (unidadeMap.get(Number(a.Apr_Unidade))  ?? null) : null,
        situacaoDescricao: a.Apr_Situacao ? (situacaoMap.get(Number(a.Apr_Situacao)) ?? null) : null,
      }));

      return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Erro ao listar CA_Aprendiz:", error);
      throw error;
    }
  }
 async getStats_new() {
    // Buscamos os agrupamentos por situação
    // Exemplo: 1=Alunos, 2=Inscritos, 3=Habilitados, etc (ajuste conforme seus IDs de status)
    const counts = await prisma.cA_Aprendiz.groupBy({
      by: ['Apr_Situacao'],
      _count: {
        Apr_Codigo: true,
      },
    });

    // Formata o retorno para o padrão que o seu Zod espera
    return {
      alunos:           this.findCount(counts, 1), 
      inscritos:        this.findCount(counts, 2),
      habilitados:      this.findCount(counts, 3),
      desligados:       this.findCount(counts, 5),
      aprendizagem:     this.findCount(counts, 6),
      inscritosinternet: this.findCount(counts, 7),
      aprovados:        this.findCount(counts, 8),
      naohabilitados:   this.findCount(counts, 9),
    };
  }

  // Lógica para o endpoint /ca-aprendiz/:id
  async getById_new(id: number) {
    return await prisma.cA_Aprendiz.findUnique({
      where: {
        Apr_Codigo: BigInt(id), // Importante: converter para BigInt se usou no schema
      },
    });
  }

  // Helper para organizar os counts
  findCount(data: any[], statusId: number) {
    return data.find(item => Number(item.situacao) === statusId)?._count.id || 0;
  }
  async getStats() {
    try {
      const [
        alunos,
        inscritos,
        habilitados,
        desligados,
        aprendizagem,
        inscritosinternet,
        aprovados,
        naohabilitados,
      ] = await Promise.all([
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(8) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(7) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(1) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: { in: [BigInt(2), BigInt(3), BigInt(4), BigInt(5)] } } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(6) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(12) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(16) } }),
        prisma.cA_Aprendiz.count({ where: { Apr_Situacao: BigInt(14) } }),
      ]);
      return { alunos, inscritos, habilitados, desligados, aprendizagem, inscritosinternet, aprovados, naohabilitados };
    } catch (error) {
      console.error("Erro ao buscar estatísticas CA_Aprendiz:", error);
      throw error;
    }
  }
 
  async getById(id: number) {
    try {
      const record = await prisma.cA_Aprendiz.findUnique({
        where: { Apr_Codigo: BigInt(id) },
      });
      return serializeAprendiz(record);
    } catch (error) {
      console.error("Erro ao buscar CA_Aprendiz:", error);
      throw error;
    }
  }

  async create(data: CaAprendizInput, userId: string) {
    try {
      const payload: any = {};

      Object.entries(data).forEach(([key, value]) => {
        if (key === "Apr_Codigo" || value === undefined) return;
        payload[key] = value;
      });

      // Campos preenchidos automaticamente
      payload.Apr_DataCadastro        = new Date();
      payload.Apr_UsuarioCadastro     = payload.Apr_UsuarioCadastro ?? userId;
      payload.Apr_UsuarioDataCadastro = new Date();
      payload.Apr_UsuarioAlteracao    = userId;
      payload.Apr_UsuarioDataAlteracao = new Date();

      if (payload.Apr_senha && payload.Apr_senha.trim() !== "") {
        payload.Apr_senha = await bcrypt.hash(payload.Apr_senha, 10);
      } else {
        delete payload.Apr_senha;
      }

      applyBigIntFields(payload);
      const created = await prisma.cA_Aprendiz.create({ data: payload });
      return serializeAprendiz(created);
    } catch (error) {
      console.error("Erro ao criar CA_Aprendiz:", error);
      throw error;
    }
  }

  async update(id: number, data: Partial<CaAprendizInput>, userId: string) {
    try {
      const payload: any = {};

      // Campos de auditoria de criação — nunca devem ser sobrescritos no update
      const READONLY_FIELDS = new Set(["Apr_Codigo", "Apr_DataCadastro", "Apr_UsuarioCadastro", "Apr_UsuarioDataCadastro"]);

      Object.entries(data).forEach(([key, value]) => {
        if (READONLY_FIELDS.has(key) || value === undefined) return;
        payload[key] = value === null ? null : value;
      });

      payload.Apr_UsuarioAlteracao     = userId;
      payload.Apr_UsuarioDataAlteracao = new Date();

      if (payload.Apr_senha && payload.Apr_senha.trim() !== "") {
        payload.Apr_senha = await bcrypt.hash(payload.Apr_senha, 10);
      } else {
        delete payload.Apr_senha;
      }

      if (Object.keys(payload).length === 2) {
        // Apenas campos de auditoria — sem mudanças reais
        return this.getById(id);
      }

      applyBigIntFields(payload);
      const updated = await prisma.cA_Aprendiz.update({
        where: { Apr_Codigo: BigInt(id) },
        data: payload,
      });
      return serializeAprendiz(updated);
    } catch (error) {
      console.error("Erro ao atualizar CA_Aprendiz:", error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await prisma.cA_Aprendiz.delete({
        where: { Apr_Codigo: BigInt(id) },
      });
    } catch (error) {
      console.error("Erro ao deletar CA_Aprendiz:", error);
      throw error;
    }
  }

}
