import { z } from "zod";
export const createAreaAtuacaoBodySchema = z.object({
  AreaDescricao: z.string().max(80).optional().nullable(),
  AreaNumeroCadastro: z.number().int().optional().nullable(),
  AreaCargaHoraria: z.number().int().optional().nullable(),
  AreaCargaTeorica4h: z.number().int().optional().nullable(),
  AreaCargaTeorica6h: z.number().int().optional().nullable(),
  AreaCargaPratica4h: z.number().int().optional().nullable(),
  AreaCargaPratica6h: z.number().int().optional().nullable(),
  AreaCertificado: z.string().max(8000).optional().nullable(),
  AreaNomeCertificado: z.string().max(150).optional().nullable(),
});
export type CreateAreaAtuacaoBody = z.infer<typeof createAreaAtuacaoBodySchema>;
export const areaAtuacaoResponseSchema = z.object({
  AreaCodigo: z.number().int(),
  AreaDescricao: z.string().nullable(),
  AreaNumeroCadastro: z.number().nullable(),
  AreaCargaHoraria: z.number().nullable(),
  AreaCargaTeorica4h: z.number().nullable(),
  AreaCargaTeorica6h: z.number().nullable(),
  AreaCargaPratica4h: z.number().nullable(),
  AreaCargaPratica6h: z.number().nullable(),
  AreaCertificado: z.string().nullable(),
  AreaNomeCertificado: z.string().nullable(),
});
export const listAreaAtuacaoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListAreaAtuacaoQuery = z.infer<typeof listAreaAtuacaoQuerySchema>;
export const listAreaAtuacaoResponseSchema = z.object({
  data: z.array(areaAtuacaoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateAreaAtuacaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateAreaAtuacaoBodySchema =
  createAreaAtuacaoBodySchema.partial();
export type UpdateAreaAtuacaoParams = z.infer<
  typeof updateAreaAtuacaoParamsSchema
>;
export type UpdateAreaAtuacaoBody = z.infer<typeof updateAreaAtuacaoBodySchema>;
export const deleteAreaAtuacaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteAreaAtuacaoParams = z.infer<
  typeof deleteAreaAtuacaoParamsSchema
>;