import { z } from "zod";
export const createGrauParentescoBodySchema = z.object({
  GpaDescricao: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres.")
    .max(30)
    .optional()
    .nullable(),
});
export type CreateGrauParentescoBody = z.infer<
  typeof createGrauParentescoBodySchema
>;
export const grauParentescoResponseSchema = z.object({
  GpaCodigo: z.number().int().positive(),
  GpaDescricao: z.string().nullable().optional(),
});
export const listGrauParentescoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListGrauParentescoQuery = z.infer<
  typeof listGrauParentescoQuerySchema
>;
export const listGrauParentescoResponseSchema = z.object({
  data: z.array(grauParentescoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateGrauParentescoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateGrauParentescoBodySchema =
  createGrauParentescoBodySchema.partial();
export type UpdateGrauParentescoParams = z.infer<
  typeof updateGrauParentescoParamsSchema
>;
export type UpdateGrauParentescoBody = z.infer<
  typeof updateGrauParentescoBodySchema
>;
export const deleteGrauParentescoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteGrauParentescoParams = z.infer<
  typeof deleteGrauParentescoParamsSchema
>;