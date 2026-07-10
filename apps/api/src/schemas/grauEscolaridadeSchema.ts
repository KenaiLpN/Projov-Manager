import { z } from "zod";
export const createGrauEscolaridadeBodySchema = z.object({
  GreDescricao: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres.")
    .max(30)
    .optional()
    .nullable(),
});
export type CreateGrauEscolaridadeBody = z.infer<
  typeof createGrauEscolaridadeBodySchema
>;
export const grauEscolaridadeResponseSchema = z.object({
  GreCodigo: z.number().int().positive(),
  GreDescricao: z.string().nullable().optional(),
});
export const listGrauEscolaridadeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListGrauEscolaridadeQuery = z.infer<
  typeof listGrauEscolaridadeQuerySchema
>;
export const listGrauEscolaridadeResponseSchema = z.object({
  data: z.array(grauEscolaridadeResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateGrauEscolaridadeParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateGrauEscolaridadeBodySchema =
  createGrauEscolaridadeBodySchema.partial();
export type UpdateGrauEscolaridadeParams = z.infer<
  typeof updateGrauEscolaridadeParamsSchema
>;
export type UpdateGrauEscolaridadeBody = z.infer<
  typeof updateGrauEscolaridadeBodySchema
>;
export const deleteGrauEscolaridadeParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteGrauEscolaridadeParams = z.infer<
  typeof deleteGrauEscolaridadeParamsSchema
>;