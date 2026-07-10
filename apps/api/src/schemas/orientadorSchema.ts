import { z } from "zod";
export const createOrientadorBodySchema = z.object({
  OriUnidadeParceiro: z.coerce
    .number()
    .int()
    .positive("A unidade parceira é obrigatória."),
  OriNome: z.string().min(3, "O nome é obrigatório.").max(50),
  OriTelefone: z.string().max(10).optional().nullable(),
  OriEmail: z.string().email().max(80).optional().nullable(),
});
export type CreateOrientadorBody = z.infer<typeof createOrientadorBodySchema>;
export const orientadorResponseSchema = z.object({
  OriCodigo: z.number().int(),
  OriUnidadeParceiro: z.number().int(),
  OriNome: z.string(),
  OriTelefone: z.string().nullable(),
  OriEmail: z.string().nullable(),
});
export const listOrientadorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListOrientadorQuery = z.infer<typeof listOrientadorQuerySchema>;
export const listOrientadorResponseSchema = z.object({
  data: z.array(orientadorResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateOrientadorParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateOrientadorBodySchema = createOrientadorBodySchema.partial();
export type UpdateOrientadorParams = z.infer<
  typeof updateOrientadorParamsSchema
>;
export type UpdateOrientadorBody = z.infer<typeof updateOrientadorBodySchema>;
export const deleteOrientadorParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteOrientadorParams = z.infer<
  typeof deleteOrientadorParamsSchema
>;