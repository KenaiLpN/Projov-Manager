import { z } from "zod";

export const createVagaBodySchema = z.object({
  ReqEmpresa: z.number(),
  ReqDataSolita__o: z.string(),
  ReqQuantidade: z.number().int(),
  ReqSexo: z.string().length(1).nullable().optional(),
  ReqHorarioEntrevista: z.string().max(50).nullable().optional(),
  ReqSubstituicao: z.string().length(1),
  ReqCaracteristicasPessoais: z.string().max(500).nullable().optional(),
  ReqAreaAtuacao: z.number(),
  ReqHabilidades: z.string().max(1000).nullable().optional(),
  ReqAtividades: z.string().max(1000).nullable().optional(),
  ReqContaoEntrevista: z.string().max(255).nullable().optional(),
  ReqObservacoes: z.string().max(500).nullable().optional(),
  ReqSituacao: z.string().length(1).nullable().optional(),
  ReqObservacoesInst: z.string().max(500).nullable().optional(),
  ReqBeneficios: z.string().max(500).nullable().optional(),
  ReqSalario: z.number().nullable().optional(),
  ReqHorarioTrabalho: z.string().max(255).nullable().optional(),
  ReqSubstituir: z.string().max(80).nullable().optional(),
  ReqDataEntrevista: z.string().nullable().optional(),
  ReqEndEntrevista: z.string().max(255).nullable().optional(),
  ReqMaiorMenor: z.string().length(1).nullable().optional(),
  ReqIdadeMinima: z.number().int().nullable().optional(),
});

export const upscaleVagaSchema = createVagaBodySchema.extend({
  ReqId: z.number().int(),
});

export const updateVagaBodySchema = createVagaBodySchema.partial();

export const vagaResponseSchema = z.object({
  ReqId: z.number(),
  ReqEmpresa: z.number(),
  ReqDataSolita__o: z.string(),
  ReqQuantidade: z.number(),
  ReqSexo: z.string().nullable(),
  ReqHorarioEntrevista: z.string().nullable(),
  ReqSubstituicao: z.string(),
  ReqAreaAtuacao: z.number(),
  ReqSituacao: z.string().nullable(),
  ReqSalario: z.number().nullable(),
  ReqHorarioTrabalho: z.string().nullable(),
  ReqDataEntrevista: z.string().nullable(),
  ReqIdadeMinima: z.number().nullable(),
});

export const listVagaResponseSchema = z.object({
  data: z.array(vagaResponseSchema),
  total: z.number(),
  pages: z.number(),
});

export const listVagaQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
});

export type CreateVagaBody = z.infer<typeof createVagaBodySchema>;
export type UpdateVagaBody = z.infer<typeof updateVagaBodySchema>;
export type ListVagaQuery = z.infer<typeof listVagaQuerySchema>;
