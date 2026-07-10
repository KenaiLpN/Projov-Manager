import { z } from "zod";
export const createOccurrenceTypeBodySchema = z.object({
  OcoDescricao: z
    .string()
    .max(50, "Descrição deve ter no máximo 50 caracteres.")
    .optional(),
  OcoTipo: z.string().max(1, "Tipo deve ter no máximo 1 caractere.").optional(),
});
export type CreateOccurrenceTypeBody = z.infer<
  typeof createOccurrenceTypeBodySchema
>;
export const occurrenceTypeResponseSchema = z.object({
  OcoCodigo: z.number().int(),
  OcoDescricao: z.string().nullable().optional(),
  OcoTipo: z.string().nullable().optional(),
});
export const listOccurrenceTypeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListOccurrenceTypeQuery = z.infer<
  typeof listOccurrenceTypeQuerySchema
>;
export const listOccurrenceTypeResponseSchema = z.object({
  data: z.array(occurrenceTypeResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateOccurrenceTypeParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateOccurrenceTypeBodySchema =
  createOccurrenceTypeBodySchema.partial();
export type UpdateOccurrenceTypeParams = z.infer<
  typeof updateOccurrenceTypeParamsSchema
>;
export type UpdateOccurrenceTypeBody = z.infer<
  typeof updateOccurrenceTypeBodySchema
>;
export const deleteOccurrenceTypeParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteOccurrenceTypeParams = z.infer<
  typeof deleteOccurrenceTypeParamsSchema
>;