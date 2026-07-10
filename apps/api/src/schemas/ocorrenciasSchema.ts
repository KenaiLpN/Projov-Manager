import { z } from "zod";
export const createOccurrenceBodySchema = z.object({
  OcoCodigo: z.coerce.number().int(),
  OcoDescricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres.").max(1000).nullable().optional(),
  OcoTipo: z.string().max(1).nullable().optional(),
});
export type CreateOccurrenceBody = z.infer<typeof createOccurrenceBodySchema>;
export const occurrenceResponseSchema = z.object({
  OcoCodigo: z.coerce.number().int(),
  OcoDescricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres.").max(1000).nullable(),
  OcoTipo: z.string().max(1).nullable(),
});
export const listOccurrenceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListOccurrenceQuery = z.infer<typeof listOccurrenceQuerySchema>;
export const listOccurrenceResponseSchema = z.object({
  data: z.array(occurrenceResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateOccurrenceParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateOccurrenceBodySchema = createOccurrenceBodySchema.partial();
export type UpdateOccurrenceParams = z.infer<
  typeof updateOccurrenceParamsSchema
>;
export type UpdateOccurrenceBody = z.infer<typeof updateOccurrenceBodySchema>;
export const deleteOccurrenceParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteOccurrenceParams = z.infer<
  typeof deleteOccurrenceParamsSchema
>;