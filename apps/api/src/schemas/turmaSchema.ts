import { z } from "zod";
export const createTurmaBodySchema = z.object({
  TurCurso: z.string().max(6).optional().nullable(),
  TurNome: z.string().max(40).optional().nullable(),
  TurDiaSemana: z.string().max(1).optional().nullable(),
  TurInicio: z.coerce.date().optional().nullable(),
  Termino: z.coerce.date().optional().nullable(),
  TurObservacoes: z.string().max(255).optional().nullable(),
  TurUsuario: z.string().max(8).optional().nullable(),
  TurStatus: z.string().max(1).optional().nullable(),
  TurPlanoCurricular: z.number().int(),
  TurUnidade: z.number().int().optional().nullable(),
  TurNumeroMeses: z.number().int().optional().nullable(),
  TurEducadorResponsavel: z.number().int().optional().nullable(),
  TurEducadorInformatica: z.number().int().optional().nullable(),
  TurSemanaEncontro: z.string().max(1).optional().nullable(),
  TurDiaSemana02: z.string().max(1).optional().nullable(),
});
export type CreateTurmaBody = z.infer<typeof createTurmaBodySchema>;
export const turmaResponseSchema = z.object({
  TurCodigo: z.number().int(),
  TurCurso: z.string().nullable(),
  TurNome: z.string().nullable(),
  TurDiaSemana: z.string().nullable(),
  TurInicio: z.date().nullable(),
  Termino: z.date().nullable(),
  TurObservacoes: z.string().nullable(),
  TurUsuario: z.string().nullable(),
  TurStatus: z.string().nullable(),
  TurPlanoCurricular: z.number(),
  TurUnidade: z.number().nullable(),
  TurNumeroMeses: z.number().nullable(),
  TurEducadorResponsavel: z.number().nullable(),
  TurEducadorInformatica: z.number().nullable(),
  TurSemanaEncontro: z.string().nullable(),
  TurDiaSemana02: z.string().nullable(),
});
export const listTurmaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListTurmaQuery = z.infer<typeof listTurmaQuerySchema>;
export const listTurmaResponseSchema = z.object({
  data: z.array(turmaResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateTurmaParamsSchema = z.object({
  id: z.coerce.number(),
});
export const updateTurmaBodySchema = createTurmaBodySchema.partial();
export type UpdateTurmaParams = z.infer<typeof updateTurmaParamsSchema>;
export type UpdateTurmaBody = z.infer<typeof updateTurmaBodySchema>;
export const deleteTurmaParamsSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteTurmaParams = z.infer<typeof deleteTurmaParamsSchema>;