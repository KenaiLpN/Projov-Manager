import { z } from "zod";
export const createUnidadeParceiroBodySchema = z.object({
  ParUniCodigoParceiro: z.coerce.number(),
  ParUniDescricao: z.string().min(3).max(80),
  ParUniCNPJ: z.string().max(14).optional().nullable(),
  ParUniEndereco: z.string().max(100).optional().nullable(),
  ParUniNumeroEndereco: z.string().max(6).optional().nullable(),
  ParUniComplemento: z.string().max(20).optional().nullable(),
  ParUniBairro: z.string().max(80).optional().nullable(),
  ParUniCidade: z.string().max(80).optional().nullable(),
  ParUniEstado: z.string().max(2).optional().nullable(),
  ParUniEmail: z.string().email().or(z.literal("")).optional().nullable(),
  ParUniNomeContato: z.string().max(50).optional().nullable(),
});
export type CreateUnidadeParceiroBody = z.infer<
  typeof createUnidadeParceiroBodySchema
>;
export const unityParceiroResponseSchema = z.object({
  ParUniCodigo: z.number(),
  ParUniCodigoParceiro: z.number(),
  ParUniDescricao: z.string(),
  ParUniCNPJ: z.string().nullable().optional(),
  ParUniEndereco: z.string().nullable().optional(),
  ParUniNumeroEndereco: z.string().nullable().optional(),
  ParUniComplemento: z.string().nullable().optional(),
  ParUniBairro: z.string().nullable().optional(),
  ParUniCidade: z.string().nullable().optional(),
  ParUniEstado: z.string().nullable().optional(),
  ParUniEmail: z.string().nullable().optional(),
  ParUniNomeContato: z.string().nullable().optional(),
  EmpresaNome: z.string().nullable().optional(),
});
export const listUnidadeParceiroQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
  empresaId: z.coerce.number().optional(),
});
export type ListUnidadeParceiroQuery = z.infer<
  typeof listUnidadeParceiroQuerySchema
>;
export const listUnidadeParceiroResponseSchema = z.object({
  data: z.array(unityParceiroResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateUnidadeParceiroParamsSchema = z.object({
  codigo: z.coerce.number(),
  parceiro: z.coerce.number(),
});
export const updateUnidadeParceiroBodySchema =
  createUnidadeParceiroBodySchema.partial();
export type UpdateUnidadeParceiroParams = z.infer<
  typeof updateUnidadeParceiroParamsSchema
>;
export type UpdateUnidadeParceiroBody = z.infer<
  typeof updateUnidadeParceiroBodySchema
>;