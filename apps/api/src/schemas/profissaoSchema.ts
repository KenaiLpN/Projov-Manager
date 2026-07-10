import { z } from "zod";
export const createProfissaoBodySchema = z.object({
  ProfDescricao: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres."),
});
export type CreateProfissaoBody = z.infer<typeof createProfissaoBodySchema>;
export const profissaoResponseSchema = z.object({
  ProfCodigo: z.number().int(),
  ProfDescricao: z.string(),
});
export const listProfissaoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListProfissaoQuery = z.infer<typeof listProfissaoQuerySchema>;
export const listProfissaoResponseSchema = z.object({
  data: z.array(profissaoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateProfissaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateProfissaoBodySchema = createProfissaoBodySchema.partial();
export type UpdateProfissaoParams = z.infer<typeof updateProfissaoParamsSchema>;
export type UpdateProfissaoBody = z.infer<typeof updateProfissaoBodySchema>;
export const deleteProfissaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteProfissaoParams = z.infer<typeof deleteProfissaoParamsSchema>;