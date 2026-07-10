import { z } from "zod";
export const createCursoBodySchema = z.object({
  CurCodigo: z
    .string()
    .max(6, "O código do curso deve ter no máximo 6 caracteres."),
  CurDescricao: z
    .string()
    .min(3, "A descrição do curso é obrigatória.")
    .max(80),
  CurCargaHoraria: z.number().int().optional().nullable(),
  CurAbreviatura: z.string().max(12).optional().nullable(),
  EnsNumeroPeriodos: z.number().int().optional().nullable(),
});
export type CreateCursoBody = z.infer<typeof createCursoBodySchema>;
export const cursoResponseSchema = z.object({
  CurCodigo: z.string(),
  CurDescricao: z.string(),
  CurCargaHoraria: z.number().nullable(),
  CurAbreviatura: z.string().nullable(),
  EnsNumeroPeriodos: z.number().nullable(),
});
export const listCursoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListCursoQuery = z.infer<typeof listCursoQuerySchema>;
export const listCursoResponseSchema = z.object({
  data: z.array(cursoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateCursoParamsSchema = z.object({
  id: z.string(),
});
export const updateCursoBodySchema = createCursoBodySchema.partial();
export type UpdateCursoParams = z.infer<typeof updateCursoParamsSchema>;
export type UpdateCursoBody = z.infer<typeof updateCursoBodySchema>;
export const deleteCursoParamsSchema = z.object({
  id: z.string(),
});
export type DeleteCursoParams = z.infer<typeof deleteCursoParamsSchema>;