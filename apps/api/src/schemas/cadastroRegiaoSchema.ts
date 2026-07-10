import { z } from "zod";
export const createCadastroRegiaoBodySchema = z.object({
  DescRegiao: z.string().min(3, "O nome da região é obrigatório.").max(40),
});
export type CreateCadastroRegiaoBody = z.infer<
  typeof createCadastroRegiaoBodySchema
>;
export const cadastroRegiaoResponseSchema = z.object({
  CodRegiao: z.number().int(),
  DescRegiao: z.string(),
});
export const listCadastroRegiaoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListCadastroRegiaoQuery = z.infer<
  typeof listCadastroRegiaoQuerySchema
>;
export const listCadastroRegiaoResponseSchema = z.object({
  data: z.array(cadastroRegiaoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateCadastroRegiaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateCadastroRegiaoBodySchema =
  createCadastroRegiaoBodySchema.partial();
export type UpdateCadastroRegiaoParams = z.infer<
  typeof updateCadastroRegiaoParamsSchema
>;
export type UpdateCadastroRegiaoBody = z.infer<
  typeof updateCadastroRegiaoBodySchema
>;
export const deleteCadastroRegiaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteCadastroRegiaoParams = z.infer<
  typeof deleteCadastroRegiaoParamsSchema
>;