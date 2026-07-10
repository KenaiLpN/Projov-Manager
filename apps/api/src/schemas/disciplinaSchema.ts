import { z } from "zod";
export const createDisciplinaBodySchema = z.object({
  DisDescricao: z
    .string()
    .min(3, "A descrição da disciplina é obrigatória.")
    .max(80),
  DisAbreviatura: z.string().max(10).optional().nullable(),
  DisCor: z.string().max(7).optional().nullable(),
});
export type CreateDisciplinaBody = z.infer<typeof createDisciplinaBodySchema>;
export const disciplinaResponseSchema = z.object({
  DisCodigo: z.number().int(),
  DisDescricao: z.string().nullable(),
  DisAbreviatura: z.string().nullable(),
  DisCor: z.string().nullable(),
});
export const listDisciplinaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListDisciplinaQuery = z.infer<typeof listDisciplinaQuerySchema>;
export const listDisciplinaResponseSchema = z.object({
  data: z.array(disciplinaResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateDisciplinaParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateDisciplinaBodySchema = createDisciplinaBodySchema.partial();
export type UpdateDisciplinaParams = z.infer<
  typeof updateDisciplinaParamsSchema
>;
export type UpdateDisciplinaBody = z.infer<typeof updateDisciplinaBodySchema>;
export const deleteDisciplinaParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteDisciplinaParams = z.infer<
  typeof deleteDisciplinaParamsSchema
>;