import { z } from "zod";

export const createRegistroGIBodySchema = z.object({
  GIRazaoSocial: z.string().min(1).max(200),
  GINomeFantasia: z.string().max(200).optional().nullable(),
  GICNPJ: z.string().max(14).optional().nullable(),
  GICNAE: z.string().max(20).optional().nullable(),
  GIInscricaoEstadual: z.string().max(20).optional().nullable(),
  GIInscricaoMunicipal: z.string().max(20).optional().nullable(),
  GIUF: z.string().max(2).optional().nullable(),
  GIEndereco: z.string().max(200).optional().nullable(),
  GIBairro: z.string().max(50).optional().nullable(),
  GICidade: z.string().max(30).optional().nullable(),
  GIComplemento: z.string().max(100).optional().nullable(),
  GINumeroEnd: z.string().max(10).optional().nullable(),
  GICep: z.string().max(9).optional().nullable(),
  GITelefone: z.string().max(10).optional().nullable(),
  GIEmail: z.string().email().or(z.literal("")).optional().nullable(),
  GIContato: z.string().max(50).optional().nullable(),
  GIEmailCobranca: z.string().email().or(z.literal("")).optional().nullable(),
  GIResponsavelCobranca: z.string().max(80).optional().nullable(),
  GIResponsavelLegal: z.string().max(80).optional().nullable(),
  GIRamoAtividade: z.string().max(80).optional().nullable(),
  GIObservacao: z.string().max(200).optional().nullable(),
  GIDataLimiteFaturamento: z.coerce.date().optional().nullable(),
  GIValeRefeicaoIntro: z.coerce.number().default(0),
  GIValeTransporteIntro: z.coerce.number().default(0),
  GIValeRefeicaoContrato: z.coerce.number().default(0),
  GIValeTransporteContrato: z.coerce.number().default(0),
  GIConvenioMedicoContrato: z.coerce.number().default(0),
  GIConvenioOdontoContrato: z.coerce.number().default(0),
  GICestaBasicaContrato: z.coerce.number().default(0),
  GIRestauranteEmpresa: z.string().max(1).default("N"),
  GIRefeicao: z.string().max(45).optional().nullable(),
  GIUniforme: z.string().max(1).default("N"),
  GIContatoProjov: z.string().max(80).optional().nullable(),
  GIDialogo: z.string().max(200).optional().nullable(),
});

export type CreateRegistroGIBody = z.infer<typeof createRegistroGIBodySchema>;

export const registroGIResponseSchema = z.object({
  GICodigo: z.number(),
  GIRazaoSocial: z.string().nullable().optional(),
  GINomeFantasia: z.string().nullable().optional(),
  GICNPJ: z.string().nullable().optional(),
  GICNAE: z.string().nullable().optional(),
  GIInscricaoEstadual: z.string().nullable().optional(),
  GIInscricaoMunicipal: z.string().nullable().optional(),
  GIUF: z.string().nullable().optional(),
  GIEndereco: z.string().nullable().optional(),
  GIBairro: z.string().nullable().optional(),
  GICidade: z.string().nullable().optional(),
  GIComplemento: z.string().nullable().optional(),
  GINumeroEnd: z.string().nullable().optional(),
  GICep: z.string().nullable().optional(),
  GITelefone: z.string().nullable().optional(),
  GIEmail: z.string().nullable().optional(),
  GIContato: z.string().nullable().optional(),
  GIEmailCobranca: z.string().nullable().optional(),
  GIResponsavelCobranca: z.string().nullable().optional(),
  GIResponsavelLegal: z.string().nullable().optional(),
  GIRamoAtividade: z.string().nullable().optional(),
  GIObservacao: z.string().nullable().optional(),
  GIDataLimiteFaturamento: z.date().nullable().optional(),
  GIValeRefeicaoIntro: z.number().nullable().optional(),
  GIValeTransporteIntro: z.number().nullable().optional(),
  GIValeRefeicaoContrato: z.number().nullable().optional(),
  GIValeTransporteContrato: z.number().nullable().optional(),
  GIConvenioMedicoContrato: z.number().nullable().optional(),
  GIConvenioOdontoContrato: z.number().nullable().optional(),
  GICestaBasicaContrato: z.number().nullable().optional(),
  GIRestauranteEmpresa: z.string().nullable().optional(),
  GIRefeicao: z.string().nullable().optional(),
  GIUniforme: z.string().nullable().optional(),
  GIContatoProjov: z.string().nullable().optional(),
  GIDialogo: z.string().nullable().optional(),
});

export const listRegistroGIQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});

export type ListRegistroGIQuery = z.infer<typeof listRegistroGIQuerySchema>;

export const listRegistroGIResponseSchema = z.object({
  data: z.array(registroGIResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const updateRegistroGIParamsSchema = z.object({
  id: z.coerce.number(),
});

export const updateRegistroGIBodySchema = createRegistroGIBodySchema.partial();

export type UpdateRegistroGIParams = z.infer<typeof updateRegistroGIParamsSchema>;
export type UpdateRegistroGIBody = z.infer<typeof updateRegistroGIBodySchema>;

export const deleteRegistroGIParamsSchema = z.object({
  id: z.coerce.number(),
});
