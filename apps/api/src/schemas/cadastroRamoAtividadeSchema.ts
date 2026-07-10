import { z } from "zod";
export const createCadastroRamoAtividadeBodySchema = z.object({
  Descricao: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres.")
    .max(60),

  CodigoCNAE: z.string().max(20).optional().nullable(),
  Observacao: z.string().optional().nullable(),
  Ativo: z.boolean().default(true),
});
export type CreateCadastroRamoAtividadeBody = z.infer<
  typeof createCadastroRamoAtividadeBodySchema
>;
export const cadastroRamoAtividadeResponseSchema = z.object({
  IdRamo: z.number().int(),
  Descricao: z.string(),
  CodigoCNAE: z.string().nullable().optional(),
  Observacao: z.string().nullable().optional(),
  Ativo: z.boolean().nullable().optional(),
  DataInclusao: z.date().nullable().optional(),
});
export const listCadastroRamoAtividadeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListCadastroRamoAtividadeQuery = z.infer<
  typeof listCadastroRamoAtividadeQuerySchema
>;
export const listCadastroRamoAtividadeResponseSchema = z.object({
  data: z.array(cadastroRamoAtividadeResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateCadastroRamoAtividadeParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateCadastroRamoAtividadeBodySchema =
  createCadastroRamoAtividadeBodySchema.partial();
export type UpdateCadastroRamoAtividadeParams = z.infer<
  typeof updateCadastroRamoAtividadeParamsSchema
>;
export type UpdateCadastroRamoAtividadeBody = z.infer<
  typeof updateCadastroRamoAtividadeBodySchema
>;
export const deleteCadastroRamoAtividadeParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteCadastroRamoAtividadeParams = z.infer<
  typeof deleteCadastroRamoAtividadeParamsSchema
>;
