import { z } from "zod";
export const createUnityBodySchema = z.object({
  UniNome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .optional()
    .nullable(),
  UniEmailPadraoEnvio: z
    .string()
    .email("Formato de e-mail inválido.")
    .optional()
    .nullable(),
  UniCGC: z.string().optional().nullable(),
  UniEndereco: z.string().optional().nullable(),
  UniEstado: z.string().optional().nullable(),
  UniCidade: z.string().optional().nullable(),
  UniBairro: z.string().optional().nullable(),
  UniCEP: z.string().optional().nullable(),
  UniTelefone: z.string().optional().nullable(),
  UniRepresentanteLegal: z.string().optional().nullable(),
  UniRepresentanteCargo: z.string().optional().nullable(),
  UniComplemento: z.string().optional().nullable(),
  UniNumeroEndereco: z.string().optional().nullable(),
  UniEnderecoWeb: z.string().optional().nullable(),
  UniTipo: z.string().optional().nullable(),
});
export type CreateUnityBody = z.infer<typeof createUnityBodySchema>;
export const unityResponseSchema = z.object({
  UniCodigo: z.number().int(),
  UniNome: z.string().nullable().optional(),
  UniRepresentanteCargo: z.string().nullable().optional(),
  UniEmailPadraoEnvio: z.string().nullable().optional(),
  UniCGC: z.string().nullable().optional(),
  UniEndereco: z.string().nullable().optional(),
  UniEstado: z.string().nullable().optional(),
  UniCidade: z.string().nullable().optional(),
  UniBairro: z.string().nullable().optional(),
  UniCEP: z.string().nullable().optional(),
  UniTelefone: z.string().nullable().optional(),
  UniRepresentanteLegal: z.string().nullable().optional(),
  UniComplemento: z.string().nullable().optional(),
  UniNumeroEndereco: z.string().nullable().optional(),
  UniEnderecoWeb: z.string().nullable().optional(),
  UniTipo: z.string().nullable().optional(),
  UniDataRefPesquisa: z.date().nullable().optional(),
});
export const listUnityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListUnityQuery = z.infer<typeof listUnityQuerySchema>;
export const listUnityResponseSchema = z.object({
  data: z.array(unityResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateUnityParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateUnityBodySchema = createUnityBodySchema.partial();
export type UpdateUnityParams = z.infer<typeof updateUnityParamsSchema>;
export type UpdateUnityBody = z.infer<typeof updateUnityBodySchema>;
export const deleteUnityParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteUnityParams = z.infer<typeof deleteUnityParamsSchema>;
