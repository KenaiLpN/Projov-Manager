import { z } from "zod";

export const createFuncaoSistemaBodySchema = z.object({
  FunSDescricao: z.string().min(1).max(200),
  FunSNomeForm: z.string().min(1).max(50),
});

export const updateFuncaoSistemaBodySchema = createFuncaoSistemaBodySchema.partial();

export const funcaoSistemaResponseSchema = z.object({
  FunSCodigo: z.number(),
  FunSDescricao: z.string(),
  FunSNomeForm: z.string(),
});

export const listFuncaoSistemaResponseSchema = z.object({
  data: z.array(funcaoSistemaResponseSchema),
  total: z.number(),
  pages: z.number(),
});

export const listFuncaoSistemaQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(1000000).default(1),
  limit: z.coerce.number().int().positive().max(1000).default(10),
  search: z.string().max(500).optional(),
});

export type CreateFuncaoSistemaBody = z.infer<typeof createFuncaoSistemaBodySchema>;
export type UpdateFuncaoSistemaBody = z.infer<typeof updateFuncaoSistemaBodySchema>;
export type ListFuncaoSistemaQuery = z.infer<typeof listFuncaoSistemaQuerySchema>;
