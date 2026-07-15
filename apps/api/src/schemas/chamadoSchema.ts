import { z } from "zod";

export const chamadoDepartamentos = [
  "Comercial",
  "Marketing",
  "Aprendizagem",
  "Projetos",
  "Administração",
] as const;

export const chamadoUrgencias = ["minima", "media", "maxima"] as const;

export const chamadoParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Número de chamado inválido."),
});

export const chamadoListQuerySchema = z.object({
  search: z.string().trim().max(180).optional(),
});

export const chamadoCreateBodySchema = z.object({
  departamento: z.enum(chamadoDepartamentos),
  descricao: z
    .string()
    .trim()
    .min(10, "Descreva o problema com pelo menos 10 caracteres.")
    .max(5000),
  observacao: z.string().trim().max(3000).optional(),
});

export const chamadoUpdateBodySchema = chamadoCreateBodySchema;

export const chamadoUrgenciaBodySchema = z.object({
  urgencia: z.enum(chamadoUrgencias),
});

export const chamadoResolucaoBodySchema = z.object({
  observacao: z.string().trim().max(3000).optional(),
});

export type ChamadoListQuery = z.infer<typeof chamadoListQuerySchema>;
export type ChamadoCreateBody = z.infer<typeof chamadoCreateBodySchema>;
export type ChamadoUpdateBody = z.infer<typeof chamadoUpdateBodySchema>;
export type ChamadoUrgenciaBody = z.infer<typeof chamadoUrgenciaBodySchema>;
export type ChamadoResolucaoBody = z.infer<typeof chamadoResolucaoBodySchema>;

