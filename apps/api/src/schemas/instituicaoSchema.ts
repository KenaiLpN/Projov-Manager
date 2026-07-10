import { z } from "zod";
export const createInstituicaoBodySchema = z.object({
  EscNome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .optional()
    .nullable(),
  EscEmail: z.string().email("E-mail inválido.").optional().nullable(),
  EscTelefone: z.string().optional().nullable(),
  EscCEP: z.string().optional().nullable(),
  EscEndereco: z.string().optional().nullable(),
  EscNumeroEndereco: z.string().optional().nullable(),
  EscBairro: z.string().optional().nullable(),
  EscCidade: z.string().optional().nullable(),
  EscEstado: z.string().optional().nullable(),
  EscComplemento: z.string().optional().nullable(),
  EscDiretor: z.string().optional().nullable(),
});
export type CreateInstituicaoBody = z.infer<typeof createInstituicaoBodySchema>;
export const instituicaoResponseSchema = z.object({
  EscCodigo: z.number().int(),
  EscNome: z.string().nullable().optional(),
  EscEmail: z.string().nullable().optional(),
  EscTelefone: z.string().nullable().optional(),
  EscCEP: z.string().nullable().optional(),
  EscEndereco: z.string().nullable().optional(),
  EscNumeroEndereco: z.string().nullable().optional(),
  EscBairro: z.string().nullable().optional(),
  EscCidade: z.string().nullable().optional(),
  EscEstado: z.string().nullable().optional(),
  EscComplemento: z.string().nullable().optional(),
  EscDiretor: z.string().nullable().optional(),
});
export const listInstituicaoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListInstituicaoQuery = z.infer<typeof listInstituicaoQuerySchema>;
export const listInstituicaoResponseSchema = z.object({
  data: z.array(instituicaoResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateInstituicaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateInstituicaoBodySchema =
  createInstituicaoBodySchema.partial();
export type UpdateInstituicaoParams = z.infer<
  typeof updateInstituicaoParamsSchema
>;
export type UpdateInstituicaoBody = z.infer<typeof updateInstituicaoBodySchema>;
export const deleteInstituicaoParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteInstituicaoParams = z.infer<
  typeof deleteInstituicaoParamsSchema
>;