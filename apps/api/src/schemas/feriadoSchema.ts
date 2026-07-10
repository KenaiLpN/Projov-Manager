import { z } from "zod";
export const createFeriadoBodySchema = z.object({
  FerUnidade: z.coerce.number().int().positive("A unidade é obrigatória."),
  FerData: z.coerce.date({
    message: "A data do feriado é obrigatória.",
  }),
  FerDescricao: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres.")
    .max(50),
  FerTipo: z.string().max(1).optional().nullable(),
});
export type CreateFeriadoBody = z.infer<typeof createFeriadoBodySchema>;
export const feriadoResponseSchema = z.object({
  FerUnidade: z.number().int(),
  FerData: z.union([z.date(), z.string()]),
  FerDescricao: z.string().nullable(),
  FerOrdem: z.number().int(),
  FerTipo: z.string().nullable(),
});
export const listFeriadoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListFeriadoQuery = z.infer<typeof listFeriadoQuerySchema>;
export const listFeriadoResponseSchema = z.object({
  data: z.array(feriadoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateFeriadoParamsSchema = z.object({
  unidade: z.coerce.number(),
  data: z.string(), 
});
export const updateFeriadoBodySchema = createFeriadoBodySchema.partial();
export type UpdateFeriadoParams = z.infer<typeof updateFeriadoParamsSchema>;
export type UpdateFeriadoBody = z.infer<typeof updateFeriadoBodySchema>;
export const deleteFeriadoParamsSchema = z.object({
  unidade: z.coerce.number(),
  data: z.string(),
});
export type DeleteFeriadoParams = z.infer<typeof deleteFeriadoParamsSchema>;