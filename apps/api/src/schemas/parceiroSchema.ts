import { z } from "zod";
export const createParceiroBodySchema = z.object({
  ParDescricao: z.string().min(3).max(80),
  ParNomeFantasia: z.string().max(80).optional().nullable(),
  ParAtividadeId: z.coerce.number(),
  ParCNPJ: z.string().max(14).optional().nullable(),
  ParEndereco: z.string().max(100).optional().nullable(),
  ParNumeroEndereco: z.string().max(6).optional().nullable(),
  ParComplemento: z.string().max(20).optional().nullable(),
  ParBairro: z.string().max(80).optional().nullable(),
  ParCidade: z.string().max(30).optional().nullable(),
  ParEstado: z.string().max(2).optional().nullable(),
  ParCEP: z.string().max(8).optional().nullable(),
  ParEmail: z.string().email().or(z.literal("")).optional().nullable(),
  ParTelefone: z.string().max(10).optional().nullable(),
  ParCelular: z.string().max(11).optional().nullable(),
  ParSituacao: z.string().max(1).default("A"),
  ParObservacoes: z.string().max(1000).optional().nullable(),
  ParInscricao: z.string().max(30).optional().nullable(),
  ParInscricaoMunicipal: z.string().max(30).optional().nullable(),
});
export type CreateParceiroBody = z.infer<typeof createParceiroBodySchema>;
export const parceiroResponseSchema = z.object({
  ParCodigo: z.number(),
  ParDescricao: z.string(),
  ParNomeFantasia: z.string().nullable().optional(),
  ParAtividadeId: z.number().nullable().optional(),
  ParCNPJ: z.string().nullable().optional(),
  ParEndereco: z.string().nullable().optional(),
  ParNumeroEndereco: z.string().nullable().optional(),
  ParComplemento: z.string().nullable().optional(),
  ParBairro: z.string().nullable().optional(),
  ParCidade: z.string().nullable().optional(),
  ParEstado: z.string().nullable().optional(),
  ParCEP: z.string().nullable().optional(),
  ParEmail: z.string().nullable().optional(),
  ParTelefone: z.string().nullable().optional(),
  ParCelular: z.string().nullable().optional(),
  ParSituacao: z.string().nullable().optional(),
  ParObservacoes: z.string().nullable().optional(),
  ParInscricao: z.string().nullable().optional(),
  ParInscricaoMunicipal: z.string().nullable().optional(),
  RamoDescricao: z.string().nullable().optional(),
});
export const listParceiroQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListParceiroQuery = z.infer<typeof listParceiroQuerySchema>;
export const listParceiroResponseSchema = z.object({
  data: z.array(parceiroResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateParceiroParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateParceiroBodySchema = createParceiroBodySchema.partial();
export type UpdateParceiroParams = z.infer<typeof updateParceiroParamsSchema>;
export type UpdateParceiroBody = z.infer<typeof updateParceiroBodySchema>;
export const deleteParceiroParamsSchema = z.object({
  id: z.coerce.number(),
});