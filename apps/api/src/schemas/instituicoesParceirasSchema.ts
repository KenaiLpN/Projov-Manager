import { z } from "zod";
export const createInstituicaoParceiraBodySchema = z.object({
  IpaDescricao: z
    .string()
    .min(3, "A descrição é obrigatória.")
    .max(80, "Máximo de 80 caracteres."),
  IpaEndereco: z.string().max(100).optional().nullable(),
  IpaNumeroEndereco: z.string().max(6).optional().nullable(),
  IpaComplemento: z.string().max(20).optional().nullable(),
  IpaBairro: z.string().max(30).optional().nullable(),
  IpaCidade: z.string().max(30).optional().nullable(),
  IpaEstado: z.string().max(2).optional().nullable(),
  IpaCEP: z.string().max(8).optional().nullable(),
  IpaEmail: z.string().email().max(80).optional().nullable(),
  IpaTelefone: z.string().max(10).optional().nullable(),
  IpaCelular: z.string().max(11).optional().nullable(),
  IpaNomeContato: z.string().max(50).optional().nullable(),
});
export type CreateInstituicaoParceiraBody = z.infer<
  typeof createInstituicaoParceiraBodySchema
>;
export const instituicaoParceiraResponseSchema = z.object({
  IpaCodigo: z.number().int(),
  IpaDescricao: z.string().nullable().optional(),
  IpaEndereco: z.string().nullable().optional(),
  IpaNumeroEndereco: z.string().nullable().optional(),
  IpaComplemento: z.string().nullable().optional(),
  IpaBairro: z.string().nullable().optional(),
  IpaCidade: z.string().nullable().optional(),
  IpaEstado: z.string().nullable().optional(),
  IpaCEP: z.string().nullable().optional(),
  IpaEmail: z.string().nullable().optional(),
  IpaTelefone: z.string().nullable().optional(),
  IpaCelular: z.string().nullable().optional(),
  IpaNomeContato: z.string().nullable().optional(),
});
export const listInstituicaoParceiraQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListInstituicaoParceiraQuery = z.infer<
  typeof listInstituicaoParceiraQuerySchema
>;
export const listInstituicaoParceiraResponseSchema = z.object({
  data: z.array(instituicaoParceiraResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateInstituicaoParceiraParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateInstituicaoParceiraBodySchema =
  createInstituicaoParceiraBodySchema.partial();
export type UpdateInstituicaoParceiraParams = z.infer<
  typeof updateInstituicaoParceiraParamsSchema
>;
export type UpdateInstituicaoParceiraBody = z.infer<
  typeof updateInstituicaoParceiraBodySchema
>;
export const deleteInstituicaoParceiraParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteInstituicaoParceiraParams = z.infer<
  typeof deleteInstituicaoParceiraParamsSchema
>;