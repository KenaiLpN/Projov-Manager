import { z } from "zod";
export const createStatusEncaminhamentoBodySchema = z.object({
  Ste_Codigo: z
    .string()
    .length(2, "O código deve ter exatamente 2 caracteres.")
    .transform((val) => val.toUpperCase()),
  Ste_Descricao: z.string().min(3, "A descrição é obrigatória.").max(80),
});
export type CreateStatusEncaminhamentoBody = z.infer<
  typeof createStatusEncaminhamentoBodySchema
>;
export const statusEncaminhamentoResponseSchema = z.object({
  Ste_Codigo: z.string(),
  Ste_Descricao: z.string(),
});
export const listStatusEncaminhamentoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListStatusEncaminhamentoQuery = z.infer<
  typeof listStatusEncaminhamentoQuerySchema
>;
export const listStatusEncaminhamentoResponseSchema = z.object({
  data: z.array(statusEncaminhamentoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateStatusEncaminhamentoParamsSchema = z.object({
  id: z.string().length(2),
});
export const updateStatusEncaminhamentoBodySchema =
  createStatusEncaminhamentoBodySchema.partial();
export type UpdateStatusEncaminhamentoParams = z.infer<
  typeof updateStatusEncaminhamentoParamsSchema
>;
export type UpdateStatusEncaminhamentoBody = z.infer<
  typeof updateStatusEncaminhamentoBodySchema
>;
export const deleteStatusEncaminhamentoParamsSchema = z.object({
  id: z.string().length(2),
});
export type DeleteStatusEncaminhamentoParams = z.infer<
  typeof deleteStatusEncaminhamentoParamsSchema
>;