import { z } from "zod";
export const createConceitoBodySchema = z.object({
  ConCodigo: z
    .string()
    .max(10, "O código do conceito deve ter no máximo 10 caracteres."),
  ConNota: z.number().optional().nullable(),
  ConPercentual: z.number().optional().nullable(),
  ConAprova: z.string().max(1).optional().nullable(),
});
export type CreateConceitoBody = z.infer<typeof createConceitoBodySchema>;
export const conceitoResponseSchema = z.object({
  ConCodigo: z.string(),
  ConNota: z.number().nullable(),
  ConPercentual: z.number().nullable(),
  ConAprova: z.string().nullable(),
});
export const listConceitoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListConceitoQuery = z.infer<typeof listConceitoQuerySchema>;
export const listConceitoResponseSchema = z.object({
  data: z.array(conceitoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateConceitoParamsSchema = z.object({
  id: z.string(),
});
export const updateConceitoBodySchema = createConceitoBodySchema.partial();
export type UpdateConceitoParams = z.infer<typeof updateConceitoParamsSchema>;
export type UpdateConceitoBody = z.infer<typeof updateConceitoBodySchema>;
export const deleteConceitoParamsSchema = z.object({
  id: z.string(),
});
export type DeleteConceitoParams = z.infer<typeof deleteConceitoParamsSchema>;