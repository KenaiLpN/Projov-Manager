import { z } from "zod";
export const createMotivoDesligamentoBodySchema = z.object({
  MotDescricao: z.string().min(3, "Descrição muito curta.").max(50),
});
export type CreateMotivoDesligamentoBody = z.infer<
  typeof createMotivoDesligamentoBodySchema
>;
export const motivoDesligamentoResponseSchema = z.object({
  MotCodigo: z.number().int().positive(),
  MotDescricao: z.string(),
});
export const listMotivoDesligamentoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListMotivoDesligamentoQuery = z.infer<
  typeof listMotivoDesligamentoQuerySchema
>;
export const listMotivoDesligamentoResponseSchema = z.object({
  data: z.array(motivoDesligamentoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateMotivoDesligamentoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateMotivoDesligamentoBodySchema =
  createMotivoDesligamentoBodySchema.partial();
export type UpdateMotivoDesligamentoParams = z.infer<
  typeof updateMotivoDesligamentoParamsSchema
>;
export type UpdateMotivoDesligamentoBody = z.infer<
  typeof updateMotivoDesligamentoBodySchema
>;
export const deleteMotivoDesligamentoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteMotivoDesligamentoParams = z.infer<
  typeof deleteMotivoDesligamentoParamsSchema
>;