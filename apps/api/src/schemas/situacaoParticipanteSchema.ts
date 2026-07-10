import { z } from "zod";
export const createSituacaoBodySchema = z.object({
  StaAbreviatura: z
    .string()
    .max(2, "Abreviação deve ter no máximo 2 caracteres.")
    .optional()
    .nullable(),
  StaDescricao: z
    .string()
    .max(50, "Descrição deve ter no máximo 50 caracteres.")
    .optional()
    .nullable(),
  StaArea: z
    .string()
    .max(1, "Area deve ter no máximo 1 caracter.")
    .optional()
    .nullable(),
});
export type CreateSituacaoBody = z.infer<typeof createSituacaoBodySchema>;
export const situacaoResponseSchema = z.object({
  StaCodigo: z.number().int(),
  StaAbreviatura: z.string().nullable().optional(),
  StaDescricao: z.string().nullable().optional(),
  StaArea: z.string().nullable().optional(),
});
export const listSituacaoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListSituacaoQuery = z.infer<typeof listSituacaoQuerySchema>;
export const listSituacaoResponseSchema = z.object({
  data: z.array(situacaoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateSituacaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateSituacaoBodySchema = createSituacaoBodySchema.partial();
export type UpdateSituacaoParams = z.infer<typeof updateSituacaoParamsSchema>;
export type UpdateSituacaoBody = z.infer<typeof updateSituacaoBodySchema>;
export const deleteSituacaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteSituacaoParams = z.infer<typeof deleteSituacaoParamsSchema>;