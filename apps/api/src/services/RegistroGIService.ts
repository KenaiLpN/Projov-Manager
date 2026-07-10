import { prisma } from "../lib/prisma";
import { CreateRegistroGIBody, UpdateRegistroGIBody } from "../schemas/registroGISchema";

export class RegistroGIService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { GIRazaoSocial: { contains: search } },
          { GINomeFantasia: { contains: search } },
          { GICNPJ: { contains: search } },
          { GIEmail: { contains: search } },
        ];
      }

      const [registros, total] = await Promise.all([
        prisma.cA_RegistroGI.findMany({
          where,
          orderBy: { GICodigo: "asc" },
          skip,
          take: limit,
          select: {
            GICodigo: true,
            GIRazaoSocial: true,
            GINomeFantasia: true,
            GICNPJ: true,
            GICidade: true,
            GIUF: true,
            GITelefone: true,
            GIEmail: true,
            GIContato: true,
            GIRamoAtividade: true,
          },
        }),
        prisma.cA_RegistroGI.count({ where }),
      ]);

      return {
        data: registros,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar RegistroGI:", error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const registro = await prisma.cA_RegistroGI.findUnique({
        where: { GICodigo: id },
      });
      return registro || null;
    } catch (error) {
      console.error("Erro ao buscar RegistroGI por ID:", error);
      return null;
    }
  }

  async create(data: CreateRegistroGIBody) {
    try {
      return await prisma.cA_RegistroGI.create({
        data: {
          GIRazaoSocial: data.GIRazaoSocial,
          GINomeFantasia: data.GINomeFantasia || null,
          GICNPJ: data.GICNPJ || null,
          GICNAE: data.GICNAE || null,
          GIInscricaoEstadual: data.GIInscricaoEstadual || null,
          GIInscricaoMunicipal: data.GIInscricaoMunicipal || null,
          GIUF: data.GIUF || null,
          GIEndereco: data.GIEndereco || null,
          GIBairro: data.GIBairro || null,
          GICidade: data.GICidade || null,
          GIComplemento: data.GIComplemento || null,
          GINumeroEnd: data.GINumeroEnd || null,
          GICep: data.GICep || null,
          GITelefone: data.GITelefone || null,
          GIEmail: data.GIEmail || null,
          GIContato: data.GIContato || null,
          GIEmailCobranca: data.GIEmailCobranca || null,
          GIResponsavelCobranca: data.GIResponsavelCobranca || null,
          GIResponsavelLegal: data.GIResponsavelLegal || null,
          GIRamoAtividade: data.GIRamoAtividade || null,
          GIObservacao: data.GIObservacao || null,
          GIDataLimiteFaturamento: data.GIDataLimiteFaturamento || null,
          GIValeRefeicaoIntro: data.GIValeRefeicaoIntro ?? 0,
          GIValeTransporteIntro: data.GIValeTransporteIntro ?? 0,
          GIValeRefeicaoContrato: data.GIValeRefeicaoContrato ?? 0,
          GIValeTransporteContrato: data.GIValeTransporteContrato ?? 0,
          GIConvenioMedicoContrato: data.GIConvenioMedicoContrato ?? 0,
          GIConvenioOdontoContrato: data.GIConvenioOdontoContrato ?? 0,
          GICestaBasicaContrato: data.GICestaBasicaContrato ?? 0,
          GIRestauranteEmpresa: data.GIRestauranteEmpresa ?? "N",
          GIRefeicao: data.GIRefeicao || null,
          GIUniforme: data.GIUniforme ?? "N",
          GIContatoProjov: data.GIContatoProjov || null,
          GIDialogo: data.GIDialogo || null,
        },
      });
    } catch (error) {
      console.error("Erro ao criar RegistroGI:", error);
      throw error;
    }
  }

  async update(id: number, data: UpdateRegistroGIBody) {
    try {
      const payload: any = {};

      if (data.GIRazaoSocial !== undefined) payload.GIRazaoSocial = data.GIRazaoSocial;
      if (data.GINomeFantasia !== undefined) payload.GINomeFantasia = data.GINomeFantasia;
      if (data.GICNPJ !== undefined) payload.GICNPJ = data.GICNPJ;
      if (data.GICNAE !== undefined) payload.GICNAE = data.GICNAE;
      if (data.GIInscricaoEstadual !== undefined) payload.GIInscricaoEstadual = data.GIInscricaoEstadual;
      if (data.GIInscricaoMunicipal !== undefined) payload.GIInscricaoMunicipal = data.GIInscricaoMunicipal;
      if (data.GIUF !== undefined) payload.GIUF = data.GIUF;
      if (data.GIEndereco !== undefined) payload.GIEndereco = data.GIEndereco;
      if (data.GIBairro !== undefined) payload.GIBairro = data.GIBairro;
      if (data.GICidade !== undefined) payload.GICidade = data.GICidade;
      if (data.GIComplemento !== undefined) payload.GIComplemento = data.GIComplemento;
      if (data.GINumeroEnd !== undefined) payload.GINumeroEnd = data.GINumeroEnd;
      if (data.GICep !== undefined) payload.GICep = data.GICep;
      if (data.GITelefone !== undefined) payload.GITelefone = data.GITelefone;
      if (data.GIEmail !== undefined) payload.GIEmail = data.GIEmail;
      if (data.GIContato !== undefined) payload.GIContato = data.GIContato;
      if (data.GIEmailCobranca !== undefined) payload.GIEmailCobranca = data.GIEmailCobranca;
      if (data.GIResponsavelCobranca !== undefined) payload.GIResponsavelCobranca = data.GIResponsavelCobranca;
      if (data.GIResponsavelLegal !== undefined) payload.GIResponsavelLegal = data.GIResponsavelLegal;
      if (data.GIRamoAtividade !== undefined) payload.GIRamoAtividade = data.GIRamoAtividade;
      if (data.GIObservacao !== undefined) payload.GIObservacao = data.GIObservacao;
      if (data.GIDataLimiteFaturamento !== undefined) payload.GIDataLimiteFaturamento = data.GIDataLimiteFaturamento;
      if (data.GIValeRefeicaoIntro !== undefined) payload.GIValeRefeicaoIntro = data.GIValeRefeicaoIntro;
      if (data.GIValeTransporteIntro !== undefined) payload.GIValeTransporteIntro = data.GIValeTransporteIntro;
      if (data.GIValeRefeicaoContrato !== undefined) payload.GIValeRefeicaoContrato = data.GIValeRefeicaoContrato;
      if (data.GIValeTransporteContrato !== undefined) payload.GIValeTransporteContrato = data.GIValeTransporteContrato;
      if (data.GIConvenioMedicoContrato !== undefined) payload.GIConvenioMedicoContrato = data.GIConvenioMedicoContrato;
      if (data.GIConvenioOdontoContrato !== undefined) payload.GIConvenioOdontoContrato = data.GIConvenioOdontoContrato;
      if (data.GICestaBasicaContrato !== undefined) payload.GICestaBasicaContrato = data.GICestaBasicaContrato;
      if (data.GIRestauranteEmpresa !== undefined) payload.GIRestauranteEmpresa = data.GIRestauranteEmpresa;
      if (data.GIRefeicao !== undefined) payload.GIRefeicao = data.GIRefeicao;
      if (data.GIUniforme !== undefined) payload.GIUniforme = data.GIUniforme;
      if (data.GIContatoProjov !== undefined) payload.GIContatoProjov = data.GIContatoProjov;
      if (data.GIDialogo !== undefined) payload.GIDialogo = data.GIDialogo;

      if (Object.keys(payload).length === 0) return null;

      return await prisma.cA_RegistroGI.update({
        where: { GICodigo: id },
        data: payload,
      });
    } catch (error) {
      console.error("Erro ao atualizar RegistroGI:", error);
      return null;
    }
  }

  async delete(id: number) {
    try {
      await prisma.cA_RegistroGI.delete({
        where: { GICodigo: id },
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar RegistroGI:", error);
      return null;
    }
  }
}
